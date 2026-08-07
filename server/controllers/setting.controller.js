const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const supabase = require('../config/supabase');

exports.getSettings = asyncHandler(async (req, res) => {
  const { data } = await supabase
    .from('settings')
    .select('store_name, store_phone, store_address, delivery_charge, free_delivery_above, logo_url, business_hours, whatsapp_enabled, upi_qr_url')
    .eq('id', 1).single();
  res.json(new ApiResponse(200, data, 'Settings fetched'));
});

exports.getFullSettings = asyncHandler(async (req, res) => {
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
  res.json(new ApiResponse(200, data, 'Full settings fetched'));
});

// All fields are plain text/URL strings — no file upload needed
exports.updateSettings = asyncHandler(async (req, res) => {
  const allowed = [
    'store_name', 'store_phone', 'store_address', 'store_email',
    'upi_id', 'upi_qr_url',           // UPI QR is just a pasted image URL
    'delivery_charge', 'free_delivery_above',
    'whatsapp_enabled', 'invoice_prefix',
    'logo_url', 'business_hours',
  ];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const { data, error } = await supabase.from('settings')
    .update(updates).eq('id', 1).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'Settings updated'));
});
