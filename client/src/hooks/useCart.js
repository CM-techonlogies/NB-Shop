import useCartStore from '../store/cartStore';
import { DELIVERY_CHARGE, FREE_DELIVERY_ABOVE } from '../constants';

export const useCart = () => {
  const store = useCartStore();

  const items = Array.isArray(store.items) ? store.items : [];
  const itemCount = items.reduce((total, item) => total + (item.qty || 0), 0);
  const subtotal = items.reduce((total, item) => {
    // Loose items: price * customQty (e.g. 2.5 kg * ₹50/kg)
    const effectiveQty = item.customQty !== undefined ? item.customQty : (item.qty || 0);
    return total + ((item.price || 0) * effectiveQty);
  }, 0);
  const deliveryCharge = subtotal > FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  const total = subtotal + deliveryCharge;
  const isFreeDelivery = subtotal > FREE_DELIVERY_ABOVE;

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

  const removeFromCart = (productId) => {
    store.removeItem(productId);
  };

  const updateQuantity = (productId, qty) => {
    store.updateQty(productId, qty);
  };

  return {
    items,
    cart: items,
    itemCount,
    subtotal,
    cartTotal: subtotal,
    deliveryCharge,
    total,
    isFreeDelivery,
    isInCart,
    getQty,
    getItem,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart: store.clearCart,
  };
};
