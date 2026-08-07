import os

root_dir = r"C:\Users\user\.gemini\antigravity\scratch\kirana-store\client"

def create_file(path, content):
    full_path = os.path.join(root_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

components = {
    "src/components/ui/Input.jsx": """import React from 'react';

export default function Input({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input 
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
""",
    "src/components/layout/Navbar.jsx": """import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-heading font-bold text-primary-500">MyKirana</Link>
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="text-gray-600 hover:text-primary-500">Cart</Link>
            <Link to="/profile" className="text-gray-600 hover:text-primary-500">Profile</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
""",
    "src/layouts/CustomerLayout.jsx": """import React from 'react';
import Navbar from '../components/layout/Navbar';

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-8 text-center mt-auto">
        <p>&copy; 2026 MyKirana Store. All rights reserved.</p>
      </footer>
    </div>
  );
}
""",
    "src/pages/customer/HomePage.jsx": """import React from 'react';
import Button from '../../components/ui/Button';

export default function HomePage() {
  return (
    <div className="animate-fadeIn">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-xl mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Fresh Groceries Delivered</h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">Get everything you need from your local Kirana store.</p>
        <Button variant="secondary" size="lg">Shop Now</Button>
      </div>
      
      <h2 className="text-2xl font-bold font-heading mb-6 text-gray-800">Featured Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gray-100 h-40 rounded-lg mb-4"></div>
            <h3 className="font-semibold text-gray-800">Product {i}</h3>
            <p className="text-primary-500 font-bold mt-2">₹199</p>
            <Button variant="outline" size="sm" fullWidth className="mt-4">Add to Cart</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
""",
    "src/routes/index.jsx": """import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import HomePage from '../pages/customer/HomePage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
    </Routes>
  );
}
"""
}

for path, content in components.items():
    create_file(path, content)

print("Additional components generated.")
