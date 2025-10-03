import os
import razorpay
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Environment
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')
RAZORPAY_WEBHOOK_SECRET = os.getenv('RAZORPAY_WEBHOOK_SECRET')
RAZORPAY_PLAN_PRO = os.getenv('RAZORPAY_PLAN_PRO')
RAZORPAY_PLAN_PREMIUM = os.getenv('RAZORPAY_PLAN_PREMIUM')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', FRONTEND_URL)

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment')
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

PLANS = {
    'pro': RAZORPAY_PLAN_PRO,
    'premium': RAZORPAY_PLAN_PREMIUM,
}


def _validate_plan(plan: str):
    if plan not in PLANS or not PLANS[plan]:
        raise ValueError('Invalid plan')


@app.get('/health')
def health():
    return jsonify({'status': 'ok'}), 200


@app.post('/api/create-checkout-session')
def create_checkout_session():
    try:
        data = request.get_json(silent=True) or {}
        user_id = data.get('user_id')
        plan = data.get('plan')
        _validate_plan(plan)

        if not user_id:
            return jsonify({'error': 'Missing user_id'}), 400

        # Verify caller's Supabase JWT to ensure they are the same user_id
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized', 'message': 'Bearer token required'}), 401
        access_token = auth_header.split(' ', 1)[1]
        try:
            user_resp = supabase.auth.get_user(access_token)
            auth_user = getattr(user_resp, 'user', None) or user_resp.get('user') if isinstance(user_resp, dict) else None
            if not auth_user:
                return jsonify({'error': 'Unauthorized', 'message': 'Invalid token'}), 401
            if auth_user.get('id') != user_id:
                return jsonify({'error': 'Forbidden', 'message': 'Cannot create session for another user'}), 403
        except Exception:
            # If SDK shape differs, attempt permissive format
            try:
                if user_resp.user.id != user_id:
                    return jsonify({'error': 'Forbidden', 'message': 'Cannot create session for another user'}), 403
            except Exception:
                return jsonify({'error': 'Unauthorized', 'message': 'Failed to verify user'}), 401

        plan_id = PLANS[plan]

        # Create Razorpay subscription. Ensure your plan is configured in Razorpay dashboard.
        subscription = razorpay_client.subscription.create({
            'plan_id': plan_id,
            'total_count': 12,  # Number of billing cycles; adjust to your needs
            'quantity': 1,
            'customer_notify': 1,
            'notes': {
                'user_id': user_id,
                'plan': plan,
            }
        })

        # Frontend should open Razorpay Checkout with this subscription_id and key_id
        return jsonify({
            'provider': 'razorpay',
            'subscription_id': subscription.get('id'),
            'key_id': RAZORPAY_KEY_ID,
            'plan': plan,
        }), 200
    except ValueError as ve:
        return jsonify({'error': 'Invalid Request', 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': 'Razorpay Error', 'message': str(e)}), 500


@app.post('/api/create-subscription')
def create_subscription():
    # Alias endpoint to maintain flexibility if frontend uses different route
    return create_checkout_session()


@app.post('/webhook')
def razorpay_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('X-Razorpay-Signature')

    if not RAZORPAY_WEBHOOK_SECRET:
        return jsonify({'error': 'Webhook not configured'}), 500

    try:
        # Verify signature; raises SignatureVerificationError on mismatch
        razorpay.Utility.verify_webhook_signature(payload, sig_header, RAZORPAY_WEBHOOK_SECRET)
        event = request.get_json(silent=True) or json.loads(payload)
    except Exception as e:
        return jsonify({'error': 'Invalid signature/payload', 'message': str(e)}), 400

    try:
        event_type = event.get('event')

        if event_type == 'subscription.activated':
            sub = (((event.get('payload') or {}).get('subscription') or {}).get('entity')) or {}
            subscription_id = sub.get('id')
            plan_id = sub.get('plan_id')
            notes = sub.get('notes') or {}
            user_id = notes.get('user_id')
            plan = 'pro' if plan_id == RAZORPAY_PLAN_PRO else ('premium' if plan_id == RAZORPAY_PLAN_PREMIUM else 'unknown')

            # Fetch plan details for amount/currency
            amount = 0
            currency = 'INR'
            try:
                plan_details = razorpay_client.plan.fetch(plan_id)
                item = plan_details.get('item', {}) if isinstance(plan_details, dict) else {}
                amount = (item.get('amount') or 0) / 100.0
                currency = item.get('currency', 'INR')
            except Exception:
                pass

            period_start_ts = sub.get('current_start') or sub.get('start_at')
            period_end_ts = sub.get('current_end') or sub.get('charge_at')
            period_start = datetime.fromtimestamp(period_start_ts, tz=timezone.utc) if period_start_ts else datetime.now(timezone.utc)
            period_end = datetime.fromtimestamp(period_end_ts, tz=timezone.utc) if period_end_ts else datetime.now(timezone.utc)

            if user_id:
                # Ensure only one active subscription per user: expire previous
                supabase.table('subscriptions').update({'status': 'expired'}).eq('user_id', user_id).eq('status', 'active').execute()

                # Insert new subscription row
                insert_payload = {
                    'user_id': user_id,
                    'plan': plan,
                    'status': 'active',
                    'amount': amount,
                    'currency': currency,
                    'payment_provider': 'razorpay',
                    'payment_id': subscription_id,
                    'start_date': period_start.isoformat(),
                    'end_date': period_end.isoformat(),
                }
                supabase.table('subscriptions').insert(insert_payload).execute()

        elif event_type in ('subscription.cancelled', 'subscription.halted', 'subscription.pending'):
            sub = (((event.get('payload') or {}).get('subscription') or {}).get('entity')) or {}
            subscription_id = sub.get('id')
            # Map to canceled; adjust if you want different states for 'halted' or 'pending'
            mapped_status = 'canceled'
            end_ts = sub.get('current_end') or sub.get('ended_at') or datetime.now(timezone.utc).timestamp()
            supabase.table('subscriptions').update({
                'status': mapped_status,
                'end_date': datetime.fromtimestamp(end_ts, tz=timezone.utc).isoformat()
            }).eq('payment_id', subscription_id).execute()

        return jsonify({'received': True}), 200
    except Exception as e:
        return jsonify({'error': 'Webhook handling failed', 'message': str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', os.getenv('PAYMENTS_PORT', 5050)))
    app.run(host='0.0.0.0', port=port)
