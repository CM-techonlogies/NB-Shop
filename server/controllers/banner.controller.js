const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const supabase = require('../config/supabase');

exports.getBanners = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('banners').select('*').eq('active', true).order('sort_order');
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, data, 'Banners fetched'));
});

exports.getAllBannersAdmin = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('banners').select('*').order('sort_order');
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, data, 'All banners'));
});

// image_url is a plain URL string from req.body
exports.createBanner = asyncHandler(async (req, res) => {
  const { title, image_url, link, type, active, sort_order } = req.body;
  if (!image_url) throw new ApiError(400, 'image_url is required');

  const { data, error } = await supabase.from('banners').insert([{
    title, image_url, link,
    type: type || 'slider',
    active: active !== false && active !== 'false',
    sort_order: parseInt(sort_order) || 0,
  }]).select().single();
  if (error) throw new ApiError(400, error.message);
  res.status(201).json(new ApiResponse(201, data, 'Banner created'));
});

exports.updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = {};
  ['title', 'image_url', 'link', 'type', 'active', 'sort_order'].forEach(k => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  const { data, error } = await supabase.from('banners')
    .update(updates).eq('id', id).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'Banner updated'));
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('banners').delete().eq('id', req.params.id);
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, {}, 'Banner deleted'));
});
