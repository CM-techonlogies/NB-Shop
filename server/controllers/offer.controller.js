const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const supabase = require('../config/supabase');

exports.getOffers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('offers').select('*').eq('active', true).order('created_at', { ascending: false });
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, data, 'Offers fetched'));
});

exports.getAllOffersAdmin = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, data, 'All offers'));
});

exports.createOffer = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('offers').insert([req.body]).select().single();
  if (error) throw new ApiError(400, error.message);
  res.status(201).json(new ApiResponse(201, data, 'Offer created'));
});

exports.updateOffer = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('offers').update(req.body).eq('id', req.params.id).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'Offer updated'));
});

exports.deleteOffer = asyncHandler(async (req, res) => {
  await supabase.from('offers').delete().eq('id', req.params.id);
  res.json(new ApiResponse(200, {}, 'Offer deleted'));
});
