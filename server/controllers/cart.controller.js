const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const supabase = require('../config/supabase');

exports.getCart = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*, product_images(url, public_id), categories(name, slug))')
    .eq('user_id', req.user.id);
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, data, 'Cart fetched'));
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;
  if (!productId) throw new ApiError(400, 'productId is required');

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, qty')
    .eq('user_id', req.user.id)
    .eq('product_id', productId)
    .single();

  let result;
  if (existing) {
    result = await supabase.from('cart_items')
      .update({ qty: existing.qty + parseInt(qty), updated_at: new Date().toISOString() })
      .eq('id', existing.id).select().single();
  } else {
    result = await supabase.from('cart_items')
      .insert([{ user_id: req.user.id, product_id: productId, qty: parseInt(qty) }]).select().single();
  }
  if (result.error) throw new ApiError(400, result.error.message);
  res.json(new ApiResponse(200, result.data, 'Added to cart'));
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { qty } = req.body;
  if (parseInt(qty) <= 0) {
    await supabase.from('cart_items').delete().eq('id', req.params.itemId).eq('user_id', req.user.id);
    return res.json(new ApiResponse(200, {}, 'Item removed'));
  }
  const { data, error } = await supabase.from('cart_items')
    .update({ qty: parseInt(qty), updated_at: new Date().toISOString() })
    .eq('id', req.params.itemId).eq('user_id', req.user.id).select().single();
  if (error) throw new ApiError(400, error.message);
  res.json(new ApiResponse(200, data, 'Cart updated'));
});

exports.removeCartItem = asyncHandler(async (req, res) => {
  await supabase.from('cart_items').delete().eq('id', req.params.itemId).eq('user_id', req.user.id);
  res.json(new ApiResponse(200, {}, 'Item removed'));
});

exports.clearCart = asyncHandler(async (req, res) => {
  await supabase.from('cart_items').delete().eq('user_id', req.user.id);
  res.json(new ApiResponse(200, {}, 'Cart cleared'));
});
