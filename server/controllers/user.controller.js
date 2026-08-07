const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const supabase = require('../config/supabase');

exports.getProfile = asyncHandler(async (req, res) => {
  const { data: addresses } = await supabase.from('addresses').select('*').eq('user_id', req.user.id);
  res.json(new ApiResponse(200, { ...req.user, addresses }, 'Profile fetched'));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const { data, error } = await supabase.from('users').update({ name, phone, updated_at: new Date().toISOString() }).eq('id', req.user.id).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'Profile updated'));
});

exports.addAddress = asyncHandler(async (req, res) => {
  const { label, name, phone, address, landmark, city, pincode, isDefault } = req.body;
  if (isDefault) await supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id);
  const { data, error } = await supabase.from('addresses').insert([{ user_id: req.user.id, label, name, phone, address, landmark, city, pincode, is_default: !!isDefault }]).select().single();
  if (error) throw new ApiError(400, error.message);
  res.status(201).json(new ApiResponse(201, data, 'Address added'));
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('addresses').update(req.body).eq('id', req.params.id).eq('user_id', req.user.id).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'Address updated'));
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  await supabase.from('addresses').delete().eq('id', req.params.id).eq('user_id', req.user.id);
  res.json(new ApiResponse(200, {}, 'Address deleted'));
});

exports.setDefaultAddress = asyncHandler(async (req, res) => {
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id);
  const { data, error } = await supabase.from('addresses').update({ is_default: true }).eq('id', req.params.id).eq('user_id', req.user.id).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'Default address set'));
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const from = (page - 1) * limit; const to = from + parseInt(limit) - 1;
  let query = supabase.from('users').select('*', { count: 'exact' }).eq('role', 'customer');
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  query = query.order('created_at', { ascending: false }).range(from, to);
  const { data, error, count } = await query;
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { data, total: count }, 'Users fetched'));
});

exports.getUserById = asyncHandler(async (req, res) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.params.id).single();
  const { data: orders } = await supabase.from('orders').select('*').eq('user_id', req.params.id).order('created_at', { ascending: false });
  res.json(new ApiResponse(200, { ...user, orders }, 'User fetched'));
});

exports.toggleUserActive = asyncHandler(async (req, res) => {
  const { data: user } = await supabase.from('users').select('is_active').eq('id', req.params.id).single();
  const { data, error } = await supabase.from('users').update({ is_active: !user.is_active }).eq('id', req.params.id).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'User status toggled'));
});
