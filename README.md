# 🛒 LetsCart - Smart AI-Powered Multi-Vendor Marketplace

**Shop Smarter, Live Better.**

LetsCart is a high-performance, production-ready multi-vendor e-commerce marketplace built using **Next.js 15 (App Router)**, **React 19**, **Prisma ORM**, **PostgreSQL (Neon)**, **Redis Cache**, **Stripe API**, and **Google Gemini AI**. 

It features secure social login, live inventory sync to prevent overselling, payout splits for multiple vendors, and a fully draggable AI Chat Assistant.

🌐 **Live Hosted URL:** [lets-cart-summer-intership-ybh4.vercel.app](https://lets-cart-summer-intership-ybh4.vercel.app)

---

## ✨ Features (Fully Completed ✅)

* **🔒 Secure Authentication (Local + OAuth):** 
  * Seamless sign-up and sign-in using Google OAuth and GitHub OAuth.
  * Role-based profiles (BUYER, SELLER) supporting multiple profiles under the same email.
* **🧠 Draggable Generative AI Shopping Assistant:**
  * Floating widget powered by Google Gemini (`gemini-2.5-flash`) that is aware of the store's active catalog.
  * **Fully draggable/movable launcher and window** on desktops and mobile devices (touch-swipes).
* **⚡ Concurrency Lock (Redis Live Inventory Sync):**
  * Prevents inventory conflicts and overselling using atomic Redis transaction reservation locks.
* **💳 Stripe Payments & Multi-Vendor Splits (Stripe Connect):**
  * Integrated checkout flow supporting Express Onboarding for vendors to link bank accounts.
  * Automatic revenue split logic for multi-vendor carts.
* **🏪 Vendor Hub & Admin Dashboards:**
  * Interactive vendor dashboard for store CRUD, product inventory tables, listings creation, and orders tracking.
* **🎨 Modern Responsive Interface:**
  * Beautiful glassmorphic navbar with dark mode support (hydration flash prevention).
  * Sliding drawer menus and fluid layouts optimized for phone, tablet, and laptop viewports.

---

## 🚀 Tech Stack

### Frontend
* Next.js 15 (App Router)
* React 19
* Redux Toolkit (Global Store Management)
* Tailwind CSS 4
* Lucide Icons & Recharts (Data Visualizations)
* React Hot Toast (Push feedback)

### Backend & Databases
* Next.js Serverless API Route endpoints
* Prisma ORM (Database query client)
* PostgreSQL (Hosted on Neon DB)
* Redis (Remote cache and stock locks)

### External Integrations
* Google Gemini API (`gemini-2.5-flash` model)
* Stripe API & Stripe Connect Express
* GitHub OAuth & Google OAuth Apps

---

## 📂 Project Structure

```
letscart/
├── app/                  # Next.js App Router paths
│   ├── (public)/         # Public buyer store pages (Home, Shop, Cart, Wishlist)
│   ├── admin/            # Admin route pages
│   ├── api/              # Backend serverless API routes
│   └── store/            # Seller profile & listing dashboards
├── assets/               # Image/icon assets
├── components/           # Reusable UI widgets & dashboards
│   ├── CartAIAssistant.jsx  # Floating draggable AI Assistant
│   └── Navbar.jsx        # Responsive glassmorphic navigation
├── lib/                  # Redis connection, database configurations, and Redux slices
├── prisma/               # Schema models & PostgreSQL sync migrations
├── public/               # Public files (logos, system assets)
└── package.json          # Dependency packages
```

---

## 📈 Roadmap Execution & Audit Status

* **Phase 1: Storefront Design & Responsive Interface** — **Completed** ✅
* **Phase 2: Social Login (Google & GitHub Auth)** — **Completed** ✅
* **Phase 3: Database Models & PostgreSQL Connection** — **Completed** ✅
* **Phase 4: Wishlist & Cart API Systems** — **Completed** ✅
* **Phase 5: Concurrency Control (Redis Stock Locks)** — **Completed** ✅
* **Phase 6: Stripe Connect Multi-Vendor Checkout** — **Completed** ✅
* **Phase 7: Vector Recommendation Service & Gemini AI Widget** — **Completed** ✅

---

## 🛠️ Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Aayushkrprasad/LetsCart-SummerIntership.git
cd LetsCart-SummerIntership
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root folder and add the following keys:
```env
NEXT_PUBLIC_CURRENCY_SYMBOL='₹'
DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
JWT_SECRET="your_secret_key"
REDIS_URL="redis://<user>:<password>@<host>:<port>"
STRIPE_SECRET_KEY="sk_test_..."
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GEMINI_API_KEY="your_gemini_api_key"
```

### 4. Run database setup & seed
```bash
npx prisma db push
```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 👨‍💻 Developer

**Aayush Kumar Prasad**  
*B.Tech in Computer Science & Engineering*  
*Summer Intern Project Portfolio*

---

## ⭐ Support & Feedback

If you find this project useful, please consider giving the repository a **⭐ Star** on GitHub!
