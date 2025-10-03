-- Update subscriptions defaults to Razorpay/INR
alter table if exists public.subscriptions
  alter column currency set default 'INR',
  alter column payment_provider set default 'razorpay';
