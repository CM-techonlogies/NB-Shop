const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const supabase = require('../config/supabase');

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

exports.getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, search, category, available, featured, trending, sort } = req.query;
  const from = (page - 1) * limit;
  const to = from + parseInt(limit) - 1;

  let query = supabase
    .from('products')
    .select('*, categories(id, name, slug), product_images(url)', { count: 'exact' });

  if (search) query = query.ilike('name', `%${search}%`);
  if (category) query = query.eq('category_id', category);
  if (available !== undefined) query = query.eq('available', available === 'true');
  if (featured !== undefined) query = query.eq('featured', featured === 'true');
  if (trending !== undefined) query = query.eq('trending', trending === 'true');

  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else if (sort === 'name') query = query.order('name', { ascending: true });
  else query = query.order('created_at', { ascending: false });

  query = query.range(from, to);

  const { data: products, error, count } = await query;
  if (error) throw new ApiError(500, error.message);

  res.json(new ApiResponse(200, {
    data: products,
    total: count,
    page: parseInt(page),
    pages: Math.ceil(count / limit),
  }, 'Products fetched'));
});

exports.getProductById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug), product_images(url)')
    .eq('id', req.params.id)
    .single();
  if (error || !data) throw new ApiError(404, 'Product not found');
  res.json(new ApiResponse(200, data, 'Product fetched'));
});

exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug), product_images(url)')
    .eq('featured', true).eq('available', true).limit(12);
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, data, 'Featured products'));
});

exports.getTrendingProducts = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug), product_images(url)')
    .eq('trending', true).eq('available', true).limit(12);
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, data, 'Trending products'));
});

exports.getNewArrivals = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug), product_images(url)')
    .eq('available', true)
    .order('created_at', { ascending: false })
    .limit(12);
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, data, 'New arrivals'));
});

const checkLoose = (val) => {
  if (val === true || val === 'true' || val === 1 || val === '1') return true;
  return false;
};

// Admin creates product — images are URL strings in req.body.images (array or comma-separated)
exports.createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, category_id, brand,
    mrp, price, stock, weight, unit, sku, barcode,
    featured, trending, tags, images, is_loose, min_quantity,
  } = req.body;

  if (!name || !mrp || !price) throw new ApiError(400, 'name, mrp and price are required');

  const slug = slugify(name) + '-' + Date.now();
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const { data: product, error } = await supabase.from('products').insert([{
    name, slug, description, category_id, brand,
    mrp: parseFloat(mrp), price: parseFloat(price), discount,
    stock: parseInt(stock) || 0, weight, unit, sku, barcode,
    featured: featured === true || featured === 'true',
    trending: trending === true || trending === 'true',
    is_loose: checkLoose(is_loose),
    min_quantity: min_quantity ? parseFloat(min_quantity) : null,
    tags: tags ? (Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim())) : [],
    available: true,
  }]).select().single();
  if (error) throw new ApiError(400, error.message);

  // Save image URLs to product_images table
  const imageUrls = Array.isArray(images) ? images : (images ? [images] : []);
  if (imageUrls.length > 0) {
    const imageRows = imageUrls
      .filter(url => url && url.trim())
      .map(url => ({ product_id: product.id, url: url.trim() }));
    if (imageRows.length > 0) {
      await supabase.from('product_images').insert(imageRows);
    }
  }

  res.status(201).json(new ApiResponse(201, product, 'Product created'));
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { images, ...rest } = req.body;

  const updates = {};
  const allowed = ['name', 'description', 'category_id', 'brand', 'mrp', 'price',
    'stock', 'weight', 'unit', 'sku', 'barcode', 'available', 'featured', 'trending',
    'tags', 'is_loose', 'min_quantity'];
  allowed.forEach(k => { if (rest[k] !== undefined) updates[k] = rest[k]; });

  // Coerce boolean / numeric fields
  if (updates.is_loose !== undefined) {
    updates.is_loose = checkLoose(updates.is_loose);
  }
  if (updates.min_quantity !== undefined) updates.min_quantity = updates.min_quantity ? parseFloat(updates.min_quantity) : null;

  if (updates.mrp && updates.price) {
    updates.discount = Math.round(((updates.mrp - updates.price) / updates.mrp) * 100);
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
  if (error) throw new ApiError(400, error.message);

  // Replace image URLs if provided
  if (images !== undefined) {
    await supabase.from('product_images').delete().eq('product_id', id);
    const imageUrls = Array.isArray(images) ? images : [images];
    const imageRows = imageUrls
      .filter(url => url && url.trim())
      .map(url => ({ product_id: id, url: url.trim() }));
    if (imageRows.length > 0) {
      await supabase.from('product_images').insert(imageRows);
    }
  }

  res.json(new ApiResponse(200, data, 'Product updated'));
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, {}, 'Product deleted'));
});

exports.toggleAvailability = asyncHandler(async (req, res) => {
  const { data: p } = await supabase.from('products').select('available').eq('id', req.params.id).single();
  const { data, error } = await supabase.from('products')
    .update({ available: !p.available }).eq('id', req.params.id).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'Availability toggled'));
});

exports.updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  const { data, error } = await supabase.from('products')
    .update({ stock: parseInt(stock) }).eq('id', req.params.id).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'Stock updated'));
});
