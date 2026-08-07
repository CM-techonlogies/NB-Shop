import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { STORE_NAME, OWNER_WHATSAPP } from '../../constants';
import { MapPinIcon, PhoneIcon, ClockIcon, ChatBubbleLeftRightIcon, QuestionMarkCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Spinner from '../../components/ui/Spinner';

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState(null);

  // Fetch live store settings from Admin Panel
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api.get('/settings').then(r => r.data?.data || r.data || {}),
    staleTime: 10 * 60 * 1000,
  });

  const settings = settingsData || {};

  const storeName    = settings.store_name    || settings.storeName    || STORE_NAME;
  const storePhone   = settings.store_phone   || settings.storePhone   || '8306050983';
  const storeAddress = settings.store_address || settings.storeAddress || 'Main Market, Kirana Store';
  const hours        = settings.business_hours|| settings.businessHours|| 'Mon - Sun: 8:00 AM - 10:00 PM';
  const whatsappNum  = settings.whatsapp_phone|| OWNER_WHATSAPP        || '918306050983';
  const upiId        = settings.upi_id        || settings.upiId        || '8306050983@ptsbi';

  const cleanWaNumber = whatsappNum.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber.startsWith('91') ? cleanWaNumber : '91' + cleanWaNumber}?text=${encodeURIComponent('Hi ' + storeName + ', I need help with my order.')}`;

  const faqs = [
    {
      q: 'How do I track my order status?',
      a: 'Go to the "My Orders" tab on top navigation (or bottom navigation on mobile). You will see live tracking statuses: Pending Payment, Confirmed, Preparing, Packed, Out for Delivery, or Delivered.'
    },
    {
      q: 'What payment options are available?',
      a: `We accept Cash on Delivery (COD) and Direct UPI Payment (${upiId}). You can pay via PhonePe, Google Pay, or Paytm directly to the store UPI ID.`
    },
    {
      q: 'How does WhatsApp order notification work?',
      a: 'When you place an order, clicking "Send on WhatsApp" opens WhatsApp with your pre-filled invoice and item list so the store owner receives your order immediately!'
    },
    {
      q: 'What is the store delivery charge & policy?',
      a: 'Delivery charges depend on your location. Orders above the free delivery threshold receive complimentary delivery right to your doorstep.'
    },
    {
      q: 'How can I modify or cancel an item in my order?',
      a: `To modify or cancel an order, tap the "Chat on WhatsApp" button below or call ${storePhone} with your Invoice ID as soon as possible.`
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-fadeIn">
      <Helmet>
        <title>Help Center & Shop Info - {storeName}</title>
      </Helmet>

      {/* Hero Header */}
      <div className="text-center mb-10">
        <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          Support &amp; General Information
        </span>
        <h1 className="text-3xl md:text-5xl font-black font-heading text-gray-900 mt-3 mb-3">
          Help Center &amp; Store Details
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Have questions or need assistance with an order? Reach out to {storeName} directly or check our store information below.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Quick Action Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {/* WhatsApp Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-3xl shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 text-2xl">
                  💬
                </div>
                <h3 className="text-xl font-black font-heading mb-1">Instant WhatsApp Support</h3>
                <p className="text-xs text-white/90 mb-6">
                  Chat directly with our store manager for order assistance, item availability, or custom queries.
                </p>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-green-700 font-bold py-3 px-6 rounded-2xl text-center text-sm shadow-sm hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Chat on WhatsApp</span> →
              </a>
            </div>

            {/* Phone Call Card */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-3xl shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 text-2xl">
                  📞
                </div>
                <h3 className="text-xl font-black font-heading mb-1">Call Store Direct</h3>
                <p className="text-xs text-white/90 mb-6">
                  Prefer calling? Speak with us on our helpline number for immediate support during business hours.
                </p>
              </div>
              <a
                href={`tel:${storePhone}`}
                className="bg-white text-primary-700 font-bold py-3 px-6 rounded-2xl text-center text-sm shadow-sm hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Call +91 {storePhone}</span> →
              </a>
            </div>
          </div>

          {/* Store General Information */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-10">
            <h2 className="text-xl font-black font-heading text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
              <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
              General Shop Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Store Address</h4>
                  <p className="text-gray-600 text-xs mt-1 leading-relaxed">{storeAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Help &amp; Support Phone</h4>
                  <p className="text-gray-600 text-xs mt-1">+91 {storePhone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Business Hours</h4>
                  <p className="text-gray-600 text-xs mt-1">{hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black font-heading text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
              <QuestionMarkCircleIcon className="w-6 h-6 text-primary-500" />
              Frequently Asked Questions (FAQ)
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full p-4 text-left font-bold text-sm text-gray-800 flex justify-between items-center bg-gray-50 hover:bg-gray-100/70 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className="text-primary-500 font-bold text-lg">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="p-4 text-xs text-gray-600 leading-relaxed bg-white border-t border-gray-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
