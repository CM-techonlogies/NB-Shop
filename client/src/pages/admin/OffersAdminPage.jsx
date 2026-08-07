import React from 'react';
import { Helmet } from 'react-helmet-async';
import { STORE_NAME } from '../../constants';

export default function OffersAdminPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <Helmet><title>Offers - {STORE_NAME} Admin</title></Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers & Coupons</h1>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Create Offer</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        Offers module coming soon.
      </div>
    </div>
  );
}
