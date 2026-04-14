# Authentication Setup Guide

## ✅ What's Been Created

Your MongoDB + NextAuth.js authentication system is ready! Here's what was built:

### 📁 File Structure
```
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts  # NextAuth handler
│   │       └── register/route.ts       # Registration API
│   ├── auth/
│   │   ├── login/page.tsx             # Login page
│   │   └── register/page.tsx          # Registration page
│   └── dashboard/page.tsx             # Protected dashboard
├── lib/
│   ├── mongoose.ts                    # MongoDB connection
│   └── auth.ts                        # NextAuth configuration
├── models/
│   └── User.ts                        # Mongoose User model
├── types/
│   └── next-auth.d.ts                 # TypeScript types
├── middleware.ts                      # Route protection
└── .env                               # Environment variables

```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB (Development)**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Recommended for Production)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `.env` with your Atlas URI:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/micro-trust-circles
```

### 3. Generate NextAuth Secret
```bash
# Generate a random secret
openssl rand -base64 32
```
Copy the output and update `NEXTAUTH_SECRET` in `.env`

### 4. Start Development Server
```bash
npm run dev
```

## 🧪 Testing the Auth System

### Register a New User
1. Go to http://localhost:3000/auth/register
2. Fill in the form:
   - Name: Mohamed
   - Email: mohamed@example.com
   - Password: test123
3. Click "Create account"

### Login
1. Go to http://localhost:3000/auth/login
2. Enter your credentials
3. You'll be redirected to `/dashboard`

### Access Protected Routes
- `/dashboard` - Protected (requires login)
- `/circles` - Protected (requires login)
- `/loans` - Protected (requires login)

## 🔐 Security Features

✅ Password hashing with bcrypt (10 salt rounds)
✅ JWT-based sessions (30-day expiry)
✅ Protected routes with middleware
✅ Email uniqueness validation
✅ Password strength validation (min 6 chars)
✅ Secure password comparison
✅ Trust Score initialization (default: 50/100)

## 📊 User Model Schema

```typescript
{
  name: string (required, 2-50 chars)
  email: string (required, unique, validated)
  password: string (required, hashed, min 6 chars)
  phone: string (optional, 10 digits)
  trustScore: number (0-100, default: 50)
  isVerified: boolean (default: false)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## 🎯 Next Steps

1. **Add OTP Verification** - Implement phone/email OTP
2. **Trust Score Algorithm** - Build ML model for trust scoring
3. **Create Trust Circles** - Build circle creation/management
4. **Add Post-Quantum Encryption** - Implement Kyber/Dilithium
5. **Build Loan System** - Create loan request/approval flow

## 🐛 Troubleshooting

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
docker ps  # or
mongosh
```

**NextAuth Error:**
- Ensure `NEXTAUTH_SECRET` is set in `.env`
- Ensure `NEXTAUTH_URL` matches your dev URL

**TypeScript Errors:**
- Run `npm install` to ensure all types are installed
- Restart your IDE/TypeScript server

## 📝 API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Login (handled by NextAuth)
- `POST /api/auth/signout` - Logout (handled by NextAuth)
- `GET /api/auth/session` - Get current session

## 🔑 Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/micro-trust-circles
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
NODE_ENV=development
```

---

**Ready to go!** 🚀 Your authentication system is fully functional with MongoDB + Mongoose.
