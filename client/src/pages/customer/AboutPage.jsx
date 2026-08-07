import React from 'react';
import { Helmet } from 'react-helmet-async';
import { STORE_NAME } from '../../constants';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fadeIn">
      <Helmet><title>About Us - {STORE_NAME}</title></Helmet>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black font-heading text-gray-900 mb-4">About {STORE_NAME}</h1>
        <p className="text-lg text-gray-600">Your trusted neighborhood grocery store, now online.</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-card space-y-6 text-gray-700 leading-relaxed text-lg">
        <p>
          Welcome to <strong>{STORE_NAME}</strong>. We have been serving our community with the freshest groceries and daily essentials for years. Now, we are bringing that same trust and quality right to your doorstep through our new digital store.
        </p>
        <p>
          Our mission is to provide you with a seamless shopping experience. No more carrying heavy bags or standing in long checkout lines. With a few clicks, you can order from a wide variety of high-quality products including rice, atta, fresh produce, snacks, and household essentials.
        </p>
        <p>
          We pride ourselves on <strong>fast delivery, genuine products, and fair pricing</strong>. Every item you purchase from us is quality-checked before it reaches you.
        </p>
        <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 text-primary-900 font-medium mt-8">
          Thank you for choosing {STORE_NAME} as your daily grocery partner. We look forward to serving you!
        </div>
      </div>
    </div>
  );
}
