import React from 'react';
import { Helmet } from 'react-helmet-async';
import { STORE_NAME } from '../../constants';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fadeIn">
      <Helmet><title>Terms & Conditions - {STORE_NAME}</title></Helmet>
      
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-card prose prose-orange max-w-none">
        <h1 className="text-3xl font-black font-heading mb-8">Terms & Conditions</h1>
        
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using our application, you accept and agree to be bound by these terms and conditions.</p>
        
        <h3>2. Orders and Deliveries</h3>
        <p>All orders are subject to availability. Delivery times are estimates and may vary based on weather, traffic, and other conditions.</p>
        
        <h3>3. Pricing and Payments</h3>
        <p>Prices are subject to change without notice. We accept payments via UPI or Cash on Delivery where applicable. For UPI, orders will be processed only after payment verification.</p>
        
        <h3>4. Returns and Refunds</h3>
        <p>Please inspect your order upon delivery. If any item is defective or incorrect, please return it to the delivery executive or contact us within 24 hours.</p>
      </div>
    </div>
  );
}
