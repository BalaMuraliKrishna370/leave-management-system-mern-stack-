# Leave Management Backend (Node.js/Express.js)

Professional backend for Leave Management System using Node.js, Express.js, and MongoDB.

## 🏗️ Project Structure

```
backend/
├── models/                 # Database schemas
│   ├── user.js            # User model with validation
│   └── Leave.js           # Leave model with indexes
├── controllers/            # Business logic
│   ├── authController.js  # Authentication logic
│   └── leaveController.js # Leave management logic
├── routes/                 # API endpoints
│   ├── authRoutes.js      # Auth routes
│   └── leaveRoutes.js     # Leave routes
├── middleware/             # Custom middleware
│   └── authMiddleware.js  # JWT verification & role checking
├── config/                 # Configuration
│   └── db.js              # MongoDB connection
├── server.js              # Express app setup
├── package.json           # Dependencies
└── .env.example           # Environment template
```

## 🚀 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_app_password
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response: { success: true, data: { id, name, email, role } }
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { success: true, data: { token, user: {...} } }
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer {token}

Response: { success: true, data: { user object } }
```

### Leave Management

#### Apply for Leave
```
POST /api/leave/apply
Authorization: Bearer {token}
Content-Type: application/json

{
  "leaveType": "earned",
  "fromDate": "2024-03-01",
  "toDate": "2024-03-03",
  "reason": "Taking a vacation to relax"
}

Response: { success: true, data: { leave object } }
```

#### Get Analytics (Admin)
```
GET /api/leave/analytics
Authorization: Bearer {token}

Response: { 
  success: true, 
  data: { 
    totalRequests, approved, pending, rejected, approvalRate
  } 
}
```

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Input validation on all endpoints
- ✅ CORS protection
- ✅ Role-based access control

## 📝 Environment Variables

Create `.env` file with:

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/leave_management
JWT_SECRET=your_super_secret_jwt_key_change_in_production
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_specific_password
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## 📋 npm Scripts

- `npm install` - Install dependencies
- `npm run dev` - Run with nodemon (development)
- `npm start` - Run production mode

## 🚀 Deployment

Deploy to Render/Railway with the same environment variables configured.

