import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from '@/components/ui/dream-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Build a UPI URL string
const buildUpiUrl = ({ pa, pn, am, tn }) => {
  const params = new URLSearchParams();
  params.set('pa', pa);
  params.set('pn', pn);
  params.set('am', String(am));
  params.set('cu', 'INR');
  if (tn) params.set('tn', tn);
  return 'upi://pay?' + params.toString();
};

const generateTxnNote = (uid) => `ADJ_${uid || 'guest'}_${Date.now()}`;

export default function Upgrade() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [prices, setPrices] = useState({ currency: 'INR', pro_inr: 415, premium_inr: 830 });
  const [selectedPlan, setSelectedPlan] = useState(params.get('plan') === 'premium' ? 'premium' : 'pro');
  const [txnNote, setTxnNote] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const UPI_ID = import.meta.env.VITE_UPI_ID || '6361698728@slc';
  const UPI_NAME = import.meta.env.VITE_UPI_NAME || 'Adaptive Dream Journey';
  const API_BASE = import.meta.env.VITE_DEMO_API || 'http://localhost:4000';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/prices`);
        if (res.ok) {
          const data = await res.json();
          if (data?.pro_inr && data?.premium_inr) setPrices(data);
        }
      } catch (_) {}
    };
    load();
  }, []);

  useEffect(() => {
    // Generate QR each time plan changes
    const uid = user?.id || 'guest';
    const note = generateTxnNote(uid);
    setTxnNote(note);
    const amount = selectedPlan === 'premium' ? prices.premium_inr : prices.pro_inr;
    const upi = buildUpiUrl({ pa: UPI_ID, pn: UPI_NAME, am: amount, tn: note });
    const img = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upi)}`;
    setQrUrl(img);
  }, [selectedPlan, prices, user]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const amount = selectedPlan === 'premium' ? prices.premium_inr : prices.pro_inr;

  const uploadScreenshot = async () => {
    try {
      if (!user?.id) {
        toast.error('Please sign in first');
        return;
      }
      if (!file) {
        toast.error('Please select a payment screenshot');
        return;
      }
      setUploading(true);
      const form = new FormData();
      form.append('userId', user.id);
      form.append('plan', selectedPlan.toUpperCase());
      form.append('amount', String(amount));
      form.append('txnNote', txnNote);
      form.append('screenshot', file);

      const res = await fetch(`${API_BASE}/upload-screenshot`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();

      const serverPlan = (json?.subscription?.plan || '').toLowerCase(); // 'pro' | 'premium'
      const subscriptionId = json?.subscription?.subscription_id || '';

      // Mirror to auth metadata so app recognizes plan
      await supabase.auth.updateUser({ data: { plan: serverPlan || selectedPlan, subscription_status: 'active' } });

      toast.success(`✅ Payment verified, plan upgraded to ${serverPlan || selectedPlan}.`);
      const ref = encodeURIComponent(subscriptionId || `${serverPlan}-${Date.now()}`);
      navigate(`/payment-success?subscription_id=${ref}`);
    } catch (e) {
      toast.error(e?.message || 'Upload failed. Is the demo backend running on port 4000?');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Upgrade Plan</h1>
            <p className="text-muted-foreground">Scan the QR, pay the plan amount, then upload the payment screenshot to activate.</p>
          </div>

          <DreamCard>
            <DreamCardHeader>
              <DreamCardTitle>Choose Plan</DreamCardTitle>
            </DreamCardHeader>
            <DreamCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${selectedPlan === 'pro' ? 'border-primary' : 'border-border/30'} bg-card/50`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">Pro</div>
                      <div className="text-2xl font-bold">₹{prices.pro_inr}</div>
                      <div className="text-sm text-muted-foreground">~$5</div>
                    </div>
                    {selectedPlan === 'pro' && <Badge variant="cosmic">Selected</Badge>}
                  </div>
                  <Button className="mt-3" variant={selectedPlan === 'pro' ? 'cosmic' : 'outline'} onClick={() => setSelectedPlan('pro')}>Select Pro</Button>
                </div>

                <div className={`p-4 rounded-lg border ${selectedPlan === 'premium' ? 'border-primary' : 'border-border/30'} bg-card/50`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">Premium</div>
                      <div className="text-2xl font-bold">₹{prices.premium_inr}</div>
                      <div className="text-sm text-muted-foreground">~$10</div>
                    </div>
                    {selectedPlan === 'premium' && <Badge variant="cosmic">Selected</Badge>}
                  </div>
                  <Button className="mt-3" variant={selectedPlan === 'premium' ? 'cosmic' : 'outline'} onClick={() => setSelectedPlan('premium')}>Select Premium</Button>
                </div>
              </div>
            </DreamCardContent>
          </DreamCard>

          <DreamCard>
            <DreamCardHeader>
              <DreamCardTitle>Pay via UPI</DreamCardTitle>
            </DreamCardHeader>
            <DreamCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-3">
                  <img src={qrUrl} alt="UPI QR" width={240} height={240} className="rounded-lg border border-border/30" />
                  <div className="text-xs text-muted-foreground">Scan with any UPI app and pay the exact amount.</div>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">UPI ID</div>
                    <div className="font-mono">{UPI_ID}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Amount (INR)</div>
                    <div className="font-semibold">₹{amount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Transaction Note</div>
                    <div className="font-mono break-all">{txnNote}</div>
                  </div>

                  <div className="pt-1">
                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="nebula" disabled={!file || uploading} onClick={uploadScreenshot}>
                      {uploading ? 'Uploading...' : 'Upload & Activate'}
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/subscription')}>Back</Button>
                  </div>
                  <div className="text-xs text-muted-foreground">After upload, your plan will be activated automatically.</div>
                </div>
              </div>
            </DreamCardContent>
          </DreamCard>
        </div>
      </div>
    </div>
  );
}
