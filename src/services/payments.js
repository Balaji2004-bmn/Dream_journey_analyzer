import { supabase } from '@/integrations/supabase/client';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com').replace(/\/+$/, '');
const PAYMENTS_URL = (import.meta.env.VITE_PAYMENTS_URL || '').replace(/\/+$/, '');

export async function createCheckoutSession(plan, userId, tokenOverride) {
  // Prefer explicitly provided token from AuthContext session
  let token = tokenOverride;
  if (!token) {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  }
  if (!token) throw new Error('Not authenticated');

  // Prefer main backend route; fallback to legacy payments service if configured
  let res = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId, plan }),
  });
  if (!res.ok && PAYMENTS_URL) {
    // Try legacy external payments service
    res = await fetch(`${PAYMENTS_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId, plan }),
    });
  }

  if (!res.ok) {
    let msg = `Failed to create checkout session (${res.status})`;
    try {
      const err = await res.json();
      if (err?.message || err?.error) msg = `${err.error || 'Error'}: ${err.message || ''}`.trim();
    } catch (_) {}
    throw new Error(msg);
  }
  // Returns either:
  // - { url } for old Stripe redirect flow
  // - { provider: 'razorpay', subscription_id, key_id, plan } for Razorpay
  return res.json();
}

export async function fetchActiveSubscription(userId) {
  // Client-side read via RLS - only returns rows for current user
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data) return data;
  // Fallback to auth user_metadata in case table or RLS isn't set
  const { data: userData } = await supabase.auth.getUser();
  const meta = userData?.user?.user_metadata || {};
  if (meta.plan) {
    return {
      id: undefined,
      user_id: userId,
      plan: meta.plan,
      status: meta.subscription_status || 'active',
      currency: 'USD',
      amount_usd: meta.plan === 'premium' ? 10 : 5,
      start_date: undefined,
      provider: 'local'
    };
  }
  if (error) throw error;
  return null;
}
