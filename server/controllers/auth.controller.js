const { Webhook } = require('svix');
const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// GET /api/auth/me - returns current user profile
exports.getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, req.user, 'User profile fetched'));
});

// POST /api/webhooks/clerk - Clerk syncs user events to our DB
exports.handleClerkWebhook = async (req, res) => {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    return res.status(500).json({ error: 'Webhook signing secret not configured' });
  }

  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const wh = new Webhook(SIGNING_SECRET);
  let evt;
  try {
    evt = wh.verify(req.body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Clerk webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  const { type, data } = evt;
  console.log(`Clerk webhook: ${type}`);

  try {
    if (type === 'user.created') {
      const primaryEmail = data.email_addresses?.[0]?.email_address || null;
      const phone = data.phone_numbers?.[0]?.phone_number?.replace('+91', '') || null;
      const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || 'User';

      await supabase.from('users').upsert({
        id: data.id,
        name,
        email: primaryEmail,
        phone,
        role: 'customer',
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      console.log(`User created/synced: ${data.id}`);
    }

    if (type === 'user.updated') {
      const primaryEmail = data.email_addresses?.[0]?.email_address || null;
      const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || 'User';

      await supabase.from('users').update({
        name,
        email: primaryEmail,
        updated_at: new Date().toISOString(),
      }).eq('id', data.id);
    }

    if (type === 'user.deleted') {
      await supabase.from('users').update({ is_active: false }).eq('id', data.id);
    }
  } catch (dbErr) {
    console.error('DB sync error in webhook:', dbErr.message);
    // Still return 200 so Clerk doesn't retry endlessly
  }

  return res.status(200).json({ received: true });
};
