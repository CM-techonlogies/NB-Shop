const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const supabase = require('../config/supabase');

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

exports.getCategories = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('categories').select('*').eq('visible', true).order('sort_order');
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, data, 'Categories fetched'));
});

exports.getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('categories').select('*').order('sort_order');
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, data, 'All categories'));
});

exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const { data: cat, error } = await supabase
    .from('categories').select('*').eq('slug', req.params.slug).single();
  if (error || !cat) throw new ApiError(404, 'Category not found');

  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(url)')
    .eq('category_id', cat.id)
    .eq('available', true);

  res.json(new ApiResponse(200, { category: cat, products }, 'Category fetched'));
});

// image_url is a plain URL string from req.body
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, sort_order, visible, image_url } = req.body;
  if (!name) throw new ApiError(400, 'Category name is required');
  const slug = slugify(name);

  const { data, error } = await supabase.from('categories').insert([{
    name, slug, description,
    image_url: image_url || null,
    sort_order: parseInt(sort_order) || 0,
    visible: visible !== false && visible !== 'false',
  }]).select().single();
  if (error) throw new ApiError(400, error.message);
  res.status(201).json(new ApiResponse(201, data, 'Category created'));
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = {};
  ['name', 'description', 'sort_order', 'visible', 'image_url'].forEach(k => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from('categories')
    .update(updates).eq('id', id).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'Category updated'));
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { count } = await supabase
    .from('products').select('id', { count: 'exact', head: true }).eq('category_id', id);
  if (count > 0) throw new ApiError(400, 'Cannot delete: products exist in this category');

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, {}, 'Category deleted'));
});
