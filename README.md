# 🛖 Tindahan

> A hyperlocal business discovery platform for Tarlac City, Philippines.  
> Find the best local businesses near you — support your community, discover hidden gems, shop local!

🌐 **Live:** [https://tindahan-eight.vercel.app](https://tindahan-eight.vercel.app)

---

## 📸 Features

- 🔍 **AI-powered natural language search** — search in English, Tagalog, or Taglish (powered by Groq + LLaMA 3.1)
- 🗺️ **Interactive map** with colored category pins and "Near me" geolocation
- 🏪 **Business listings** with cover photos, ratings, categories, and verified badges
- ⭐ **Reviews & ratings** with owner replies
- 📢 **Announcements** — owners can post promos and updates
- 📸 **Photo uploads** via Cloudinary with lightbox viewer
- 💾 **Save businesses** to your profile
- 📊 **Owner dashboard** — manage listings, view analytics, post announcements
- ✅ **Verification system** — owners request verification, admin approves
- 👤 **User profiles** with editable name and password
- 🌙 **Dark mode**
- 📱 **Mobile responsive** with hamburger navbar
- 🔔 **Toast notifications** and loading skeletons
- 🔒 **Secure** — JWT auth, rate limiting, Helmet headers, CORS lockdown

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React + Vite | UI framework |
| React Router | Client-side routing |
| Leaflet.js | Interactive maps |
| Axios | API requests |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| PostgreSQL (Neon) | Database |
| JWT | Authentication |
| Cloudinary | Photo storage |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |

### AI Service
| Tech | Purpose |
|------|---------|
| Python + Flask | AI microservice |
| Groq (LLaMA 3.1) | Natural language search |
| TextBlob | Sentiment analysis |
| Gunicorn | Production server |

### Admin Panel
| Tech | Purpose |
|------|---------|
| Laravel (PHP) | Admin dashboard |
| Blade templates | Admin UI |

### DevOps
| Tech | Purpose |
|------|---------|
| Vercel | Frontend hosting |
| Render | Backend + AI hosting |
| Neon.tech | Serverless PostgreSQL |
| GitHub | Version control |

---

## 🗄️ Database Schema

```
users — id, name, email, password_hash, role
businesses — id, owner_id, category_id, name, description, address, lat, lng, phone, hours, is_verified, verification_requested, view_count
categories — id, name, icon
business_photos — id, business_id, url
business_categories — business_id, category_id
reviews — id, user_id, business_id, rating, body, owner_reply
saved_businesses — user_id, business_id
announcements — id, business_id, title, body, expires_at
barangays — id, name, center_lat, center_lng
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- Python 3.10+
- PostgreSQL
- PHP 8+ (for admin panel)

### 1. Clone the repo
```bash
git clone https://github.com/krez-dot/tindahan.git
cd tindahan
```

### 2. Backend setup
```bash
cd server
npm install --legacy-peer-deps
cp .env.example .env   # fill in your values
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
npm run dev
```

### 4. AI service setup
```bash
cd ai
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
# create .env with GROQ_API_KEY=your_key
python app.py
```

### 5. Admin panel setup
```bash
cd admin
composer install
php artisan serve
```

### Environment Variables

**server/.env**
```
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
AI_SERVICE_URL=http://localhost:5001
ALLOWED_ORIGINS=http://localhost:5173
```

**ai/.env**
```
GROQ_API_KEY=your_groq_key
```

---

## 📦 Project Structure

```
tindahan/
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/   # Home, BusinessPage, AddBusiness, Profile, etc.
│       ├── components/  # Navbar, ProtectedRoute
│       └── api/     # Axios config
├── server/          # Node.js + Express backend
│   ├── routes/      # businesses, auth, reviews, upload, etc.
│   ├── db.js        # PostgreSQL connection
│   └── migrate.js   # DB migrations
├── ai/              # Python Flask AI microservice
│   └── app.py       # Groq search + sentiment analysis
└── admin/           # Laravel admin panel
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|---------|-----|
| Frontend | Vercel | https://tindahan-eight.vercel.app |
| Backend API | Render | https://tindahan-ak97.onrender.com |
| AI Service | Render | https://tindahan-ai.onrender.com |
| Database | Neon.tech | AWS AP Southeast 1 (Singapore) |

---

## 👨‍💻 Built By

**Mark Joseph Garcia** ([@krez-dot](https://github.com/krez-dot))  
Built with the help of Claude AI 🤖🧡

---

## 📝 License

This project is for educational purposes. Made with 🧡 for Tarlac City.