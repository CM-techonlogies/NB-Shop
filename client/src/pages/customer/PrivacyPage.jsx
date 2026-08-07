import React from 'react';
import { Helmet } from 'react-helmet-async';
import { STORE_NAME } from '../../constants';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fadeIn">
      <Helmet><title>Privacy Policy - {STORE_NAME}</title></Helmet>
      
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-card prose prose-orange max-w-none">
        <h1 className="text-3xl font-black font-heading mb-8">Privacy Policy</h1>
        
        <h3>1. Information We Collect</h3>
        <p>We collect personal information such as your name, phone number, and delivery address to fulfill your grocery orders. We may also collect device information to improve our app experience.</p>
        
        <h3>2. How We Use Your Information</h3>
        <p>Your information is used strictly to process orders, communicate with you regarding your deliveries, and improve our services. We do not sell your personal data to third parties.</p>
        
        <h3>3. Data Security</h3>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.</p>
        
        <h3>4. Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact us at our store.</p>
      </div>
    </div>
  );
}
