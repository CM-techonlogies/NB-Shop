# 🛒 MyKirana Store — PWA

A full-stack, mobile-first Progressive Web Application for a local Kirana (grocery) store. Customers can browse products, add to cart, place orders, and receive invoice + UPI QR code via WhatsApp.

---

## 📁 Project Structure

```
kirana-store/
├── client/     ← React + Vite + Tailwind (Frontend)
└── server/     ← Node.js + Express + MongoDB (Backend)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Firebase project (for Phone OTP)
- Meta WhatsApp Business API (optional, for messages)

### 1. Backend Setup

```bash
cd server
cp .env.example .env
# Fill in your credentials in .env
npm install
npm run dev
```

Server runs on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd client
cp .env.example .env
# Fill in your Firebase credentials in .env
npm install
npm run dev
```

App runs on: `http://localhost:5173`

---

## 🔑 Environment Variables

### `server/.env`

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random secret for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `WHATSAPP_TOKEN` | Meta WhatsApp Cloud API token |
| `WHATSAPP_PHONE_ID` | Meta WhatsApp phone number ID |
| `OWNER_WHATSAPP` | Owner's WhatsApp number (91XXXXXXXXXX) |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (default: http://localhost:5000/api) |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_STORE_NAME` | Your store name |
| `VITE_OWNER_WHATSAPP` | Owner's WhatsApp (91XXXXXXXXXX) |

---

## 👤 User Roles

### Customer
- Browse & search products
- Add to cart
- Place orders
- View order history & download invoices
- Receive WhatsApp order updates

### Admin (`/admin`)
- Dashboard with sales analytics
- Manage products, categories, banners, offers
- Process orders & update status
- Manage customers
- Configure store settings & UPI QR

---

## 📱 Key Pages

| Route | Page |
|---|---|
| `/` | Home (hero slider, categories, products) |
| `/products` | Product listing with filters |
| `/product/:id` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout with address form |
| `/orders` | Order history |
| `/login` | Phone OTP login |
| `/admin` | Admin dashboard |

---

## 🔄 Order Flow

```
Customer places order
    → Invoice PDF generated (pdfkit)
    → PDF uploaded to Cloudinary
    → WhatsApp sent to customer (invoice + UPI QR)
    → WhatsApp sent to owner (new order alert)
    → Customer pays via UPI
    → Customer sends screenshot on WhatsApp
    → Admin verifies & updates status
    → WhatsApp status updates sent at each step
```

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Zustand, React Query, Framer Motion, Swiper.js, React Hook Form

**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JWT, Firebase Admin, Multer, Cloudinary, pdfkit

**Deployment:** Frontend → Vercel | Backend → Railway | DB → MongoDB Atlas

---

## 📦 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ to Vercel
```

### Backend (Railway)
- Connect Railway to your GitHub repo
- Set all environment variables in Railway dashboard
- Railway auto-detects Node.js and runs `npm start`

---

## 🚧 Future Enhancements

- Firebase Phone OTP (production)
- PWA install prompt
- Hindi/English language switch
- Loyalty points system
- Barcode scanning
- AI-based recommendations
- Multiple store branches
