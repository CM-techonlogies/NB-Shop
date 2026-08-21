import useCartStore from '../store/cartStore';
import { useSettings } from './useSettings';

export const useCart = () => {
  const store = useCartStore();
  const { data: settings } = useSettings();

  // Safely parse dynamic settings configured by admin
  const freeDeliveryAbove = settings?.free_delivery_above !== undefined && settings?.free_delivery_above !== null
    ? parseFloat(settings.free_delivery_above)
    : 499;

  const chargePerOrder = settings?.delivery_charge !== undefined && settings?.delivery_charge !== null
    ? parseFloat(settings.delivery_charge)
    : 40;

  const items = Array.isArray(store.items) ? store.items : [];
  const itemCount = items.reduce((total, item) => total + (item.qty || 0), 0);
  const subtotal = items.reduce((total, item) => {
    // Loose items: price * customQty (e.g. 2.5 kg * ₹50/kg)
    const effectiveQty = item.customQty !== undefined ? item.customQty : (item.qty || 0);
    return total + ((item.price || 0) * effectiveQty);
  }, 0);

  const isFreeDelivery = subtotal > 0 && subtotal >= freeDeliveryAbove;
  const deliveryCharge = (subtotal > 0 && !isFreeDelivery) ? chargePerOrder : 0;
  const total = subtotal + deliveryCharge;

  const matchTarget = (item, targetId) => {
    if (!item || targetId === undefined || targetId === null) return false;
    return String(item.id || item._id) === String(targetId);
  };

  const resolveId = (product) => product?.id || product?._id;

  const isInCart = (productId) =>
    items.some(i => matchTarget(i, productId));

  const getQty = (productId) => {
    const item = items.find(i => matchTarget(i, productId));
    return item ? item.qty : 0;
  };

  const getItem = (productId) => {
    return items.find(i => matchTarget(i, productId)) || null;
  };

  const addToCart = (product) => {
    const id = resolveId(product);
    store.addItem({ ...product, id });
  };

  // For loose items: pass customQty (e.g. 0.5 kg)
  const addToCartWithQty = (product, customQty) => {
    const id = resolveId(product);
    store.addItem({ ...product, id, customQty: parseFloat(customQty) });
  };

  const removeFromCart = (productId) => {
    store.removeItem(productId);
  };

  const updateQuantity = (productId, qty) => {
    store.updateQty(productId, qty);
  };

  const updateCustomQty = (productId, customQty) => {
    store.updateCustomQty(productId, customQty);
  };

  return {
    items,
    cart: items,
    itemCount,
    subtotal,
    cartTotal: subtotal,
    deliveryCharge,
    freeDeliveryAbove,
    chargePerOrder,
    total,
    isFreeDelivery,
    isInCart,
    getQty,
    getItem,
    addToCart,
    addToCartWithQty,
    removeFromCart,
    updateQuantity,
    updateCustomQty,
    clearCart: store.clearCart,
  };
};
