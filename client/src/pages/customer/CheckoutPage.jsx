import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useCart } from '../../hooks/useCart';
import { useCreateOrder } from '../../hooks/useOrders';
import { useLanguageStore } from '../../store/languageStore';
import CartSummary from '../../components/cart/CartSummary';
import { STORE_NAME, OWNER_WHATSAPP } from '../../constants';
import { sendOrderToOwnerWhatsApp } from '../../utils/whatsapp';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { t } = useLanguageStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Method Selection ('cod' vs 'upi')
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [codChangeNote, setCodChangeNote] = useState('');

  // Precise GPS location state
  const [gpsLocation, setGpsLocation] = useState(null); // { lat, lng, mapsUrl }
  const [isLocating, setIsLocating] = useState(false);

  // Store UPI details
  const storeUpiId = `${OWNER_WHATSAPP}@paytm`; // default fallback upi id

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      landmark: '',
      city: 'Delhi',
      pincode: '',
      notes: ''
    }
  });

  // C1 FIX: navigate() must be in useEffect, not during render
  useEffect(() => {
    if (cart.length === 0) navigate('/cart');
  }, [cart.length, navigate]);
  if (cart.length === 0) return null;

  // Geolocation detection handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        setGpsLocation({ lat, lng, mapsUrl });
        setIsLocating(false);
        toast.success('📍 Precise GPS location detected & attached!');
      },
      (err) => {
        setIsLocating(false);
        toast.error('Unable to detect GPS location. Please enable location permissions on your device.');
        console.error('GPS error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // M1 FIX: guard clipboard API — not available on HTTP or older browsers
  const handleCopyUpi = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(storeUpiId);
      } else {
        // Fallback for HTTP/older browsers
        const el = document.createElement('textarea');
        el.value = storeUpiId;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      toast.success('UPI ID copied to clipboard! 📋');
    } catch {
      toast.error('Could not copy. Please copy manually: ' + storeUpiId);
    }
  };

  const onSubmit = async (data) => {
    // MANDATORY GPS CHECK
    if (!gpsLocation || !gpsLocation.lat) {
      toast.error(t('gps_required_msg'), {
        duration: 5000,
        icon: '⚠️',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const shippingAddress = {
        fullName: data.name,
        phone: data.phone,
        addressLine: data.address,
        landmark: data.landmark,
        city: data.city,
        pincode: data.pincode,
        latitude: gpsLocation.lat,
        longitude: gpsLocation.lng,
        mapsUrl: gpsLocation.mapsUrl,
      };

      const paymentLabel = paymentMethod === 'cod' 
        ? `Cash on Delivery${codChangeNote ? ` (Change needed: ${codChangeNote})` : ''}` 
        : 'Store Pickup (Pay at Store)';
      
      const formattedNotes = data.notes 
        ? `[Payment Mode: ${paymentLabel}] ${data.notes}` 
        : `[Payment Mode: ${paymentLabel}]`;

      const orderData = {
        shippingAddress,
        items: cart.map(item => {
          // For loose items: send customQty (e.g. 1.5 kg) as quantity
          // For fixed items: send normal qty (e.g. 2 bags)
          // mn3 FIX: also check customQty > 0 to avoid sending qty=0
          const effectiveQty = (item.customQty !== undefined && item.customQty > 0) ? item.customQty : (item.qty || 1);
          return {
            product: item.id,
            quantity: effectiveQty,
            price: item.price,
            is_loose: !!item.customQty,
            unit: item.unit || '',
          };
        }),
        notes: formattedNotes,
      };

      const result = await createOrder.mutateAsync(orderData);
      const order = result?.data;
      const orderId = order?.id || order?._id;

      // C2 FIX: guard against undefined orderId before navigating
      clearCart();
      toast.success('Order placed successfully! 🎉');
      sendOrderToOwnerWhatsApp(order, cart, shippingAddress);
      const targetPath = orderId ? `/order/${orderId}` : '/orders';
      setTimeout(() => navigate(targetPath), 500);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to place order. Please try again.';
      toast.error(msg);
      console.error('Failed to create order', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-gray-50/50">
      <Helmet>
        <title>{`${t('secure_checkout')} - ${STORE_NAME}`}</title>
      </Helmet>

      <h1 className="text-2xl md:text-4xl font-bold font-heading text-gray-900 mb-8 text-center md:text-left">
        {t('secure_checkout')}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Delivery Address Form */}
        <div className="lg:w-2/3">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-card">
            
            {/* Header */}
            <div className="mb-6 border-b pb-4">
              <h2 className="text-xl font-bold font-heading text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">1</span>
                {t('delivery_details')}
              </h2>
            </div>
            
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name & Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('full_name')}</label>
                  <input
                    {...register("name", { required: "Name is required" })}
                    className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:border-primary-500 transition-colors ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary-100'}`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone_number')}</label>
                  <input
                    type="tel"
                    {...register("phone", { 
                      required: "Phone is required",
                      pattern: { value: /^[0-9]{10}$/, message: "Must be a 10 digit number" }
                    })}
                    className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 transition-colors ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary-100'}`}
                    placeholder="9876543210"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              {/* GPS Location Detector (Placed right below Name & Phone) */}
              <div className={`p-4 rounded-2xl border transition-all ${
                gpsLocation
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-2xs'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{gpsLocation ? '✅' : '📍'}</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {gpsLocation ? t('gps_attached') : t('detect_gps')}
                      </span>
                      {!gpsLocation && (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                          Required *
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {gpsLocation 
                        ? `📍 GPS Coordinates attached: ${gpsLocation.lat.toFixed(5)}, ${gpsLocation.lng.toFixed(5)}`
                        : t('gps_required_msg')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-4 py-2.5 rounded-xl text-xs border shadow-sm transition-all active:scale-95 disabled:opacity-50 ${
                        gpsLocation
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                          : 'bg-primary-500 hover:bg-primary-600 text-white border-primary-500 animate-pulse'
                      }`}
                    >
                      {isLocating ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>{t('gps_locating')}</span>
                        </>
                      ) : (
                        <>
                          <span>{gpsLocation ? '🔄 Update GPS' : '📍 Detect GPS Location'}</span>
                        </>
                      )}
                    </button>

                    {gpsLocation && (
                      <a
                        href={gpsLocation.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-emerald-700 hover:bg-emerald-50 text-xs font-bold whitespace-nowrap shadow-2xs"
                        title="Verify on Google Maps"
                      >
                        Maps ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('complete_address')}</label>
                <textarea
                  {...register("address", { required: "Address is required" })}
                  rows="3"
                  className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 transition-colors resize-none ${errors.address ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary-100'}`}
                  placeholder="House/Flat No., Building Name, Street"
                ></textarea>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pincode')}</label>
                  <input
                    {...register("pincode", { 
                      required: "Pincode is required",
                      pattern: { value: /^[0-9]{6}$/, message: "Must be 6 digits" }
                    })}
                    className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 transition-colors ${errors.pincode ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary-100'}`}
                    placeholder="110001"
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                </div>
                
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')}</label>
                  <input
                    {...register("city", { required: "City is required" })}
                    className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 transition-colors ${errors.city ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary-100'}`}
                    placeholder="Delhi"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('landmark')}</label>
                  <input
                    {...register("landmark")}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-colors"
                    placeholder="Near Apollo Hospital"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('delivery_notes')}</label>
                <input
                  {...register("notes")}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-colors"
                  placeholder="e.g. Leave at security, call before arriving..."
                />
              </div>
            </form>
          </div>
          
          {/* Enhanced Selectable Payment Method Options */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-card mt-6">
            <h2 className="text-xl font-bold font-heading text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">2</span>
              {t('payment_method')}
            </h2>

            <div className="space-y-4">
              {/* Option 1: Cash on Delivery */}
              <div 
                onClick={() => setPaymentMethod('cod')}
                className={`p-5 border-2 rounded-2xl cursor-pointer transition-all flex flex-col gap-3 ${
                  paymentMethod === 'cod' 
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <input 
                    type="radio" 
                    name="paymentMode" 
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')}
                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                  />
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💵</span>
                        <p className="font-bold text-gray-900 text-sm">{t('cod_title')}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{t('cod_desc')}</p>
                    </div>
                  </div>
                </div>

                {/* COD Change Note Helper */}
                {paymentMethod === 'cod' && (
                  <div className="mt-2 pt-3 border-t border-emerald-200/80 flex items-center gap-2">
                    <span className="text-xs text-emerald-800 font-semibold whitespace-nowrap">{t('need_change')}</span>
                    <input 
                      type="text"
                      value={codChangeNote}
                      onChange={(e) => setCodChangeNote(e.target.value)}
                      placeholder="e.g. Change for ₹500 note"
                      className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Option 2: Store Pickup & Pay */}
              <div 
                onClick={() => setPaymentMethod('pickup')}
                className={`p-5 border-2 rounded-2xl cursor-pointer transition-all flex flex-col gap-3 ${
                  paymentMethod === 'pickup' 
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <input 
                    type="radio" 
                    name="paymentMode" 
                    checked={paymentMethod === 'pickup'} 
                    onChange={() => setPaymentMethod('pickup')}
                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                  />
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏬</span>
                        <p className="font-bold text-gray-900 text-sm">{t('pickup_title')}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{t('pickup_desc')}</p>
                    </div>
                    
                    {/* Badge */}
                    <div className="flex items-center gap-1.5 self-start sm:self-center">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg flex items-center gap-1">
                        <span>🏬</span> Store Pickup
                      </span>
                    </div>
                  </div>
                </div>

                {/* Helpful Note for Store Pickup */}
                {paymentMethod === 'pickup' && (
                  <div className="mt-1 p-3 bg-white border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                    <span>ℹ️</span>
                    <span>Your order will be packed and ready for pickup at our store counter. You can pay via Cash or UPI at the store.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <CartSummary showCheckoutButton={false} />
            
            <button 
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full mt-6 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-lg flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {t('processing')}
                </>
              ) : (
                t('place_order')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
