# Leave Management System (MERN Stack)

A professional, full-stack Leave Management System built with MongoDB, Express.js, React.js, and Node.js. This application allows employees to apply for leaves and enables administrators to approve or reject leave requests with comprehensive analytics.

## 🎯 Project Objectives

- Build a complete leave management solution
- Implement role-based access control (Employee/Admin)
- Provide real-time leave balance tracking
- Enable email notifications for leave approvals/rejections
- Deliver professional UI/UX with responsive design
- Include pagination, search, and analytics features

## 🏗️ Architecture

### MVC Structure (Backend)
```
backend/
├── models/           # Database schemas
├── controllers/      # Business logic
├── routes/           # API endpoints
├── middleware/       # Authentication & validation
├── config/           # Database configuration
└── server.js         # Entry point
```

### React Structure (Frontend)
```
frontend/
├── src/
│   ├── pages/        # Page components
│   ├── components/   # Reusable components
│   ├── context/      # Global state management
│   ├── services/     # API calls
│   ├── styles/       # Component styles
│   └── App.js        # Main app entry
```

## 📋 Features

### Employee Features
- ✅ User Registration & Login with JWT
- ✅ Apply for Earned/Sick Leave
- ✅ Set leave period with date validation
- ✅ View leave balance (12 + 12 days)
- ✅ Track leave status (Pending/Approved/Rejected)
- ✅ View leave history with pagination
- ✅ Receive email notifications

### Admin Features
- ✅ Secure admin login
- ✅ View all leave requests with filters
- ✅ Approve/Reject leave requests
- ✅ Add comments with actions
- ✅ View comprehensive analytics
- ✅ Search & filter leaves by status/keyword
- ✅ Pagination for efficient browsing

### Advanced Features
- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Email notifications (Gmail SMTP)
- ✅ Pagination & search functionality
- ✅ Admin analytics dashboard
- ✅ Responsive mobile design
- ✅ Error handling & validation

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs
- **Email**: nodemailer
- **Validation**: Built-in middleware

### Frontend
- **Library**: React.js 19.2.4
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Styling**: Bootstrap 5 + Custom CSS
- **State Management**: React Context API

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account
- Gmail account (for email features)

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` with your credentials**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/leave_management
   JWT_SECRET=your_super_secret_jwt_key
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_specific_password
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder**
   ```bash
   cd real-development-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   App will open on `http://localhost:3000`

## 📚 API Endpoints

### Authentication APIs
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
GET    /api/auth/profile        - Get current user profile
```

### Employee APIs
```
POST   /api/leave/apply         - Apply for leave
GET    /api/leave/myLeaves      - Get user's leaves (with pagination)
GET    /api/leave/balance       - Get leave balance
```

### Admin APIs
```
GET    /api/leave/all           - Get all leaves (with pagination & search)
PUT    /api/leave/status/:id    - Update leave status
GET    /api/leave/analytics     - Get analytics data
```

## 🔐 Authentication Flow

1. User registers with email/password
2. Password hashed using bcryptjs
3. User logs in, receives JWT token
4. Token stored in localStorage
5. Token sent with each API request
6. Protected routes check token validity
7. Expired tokens trigger logout

## 📊 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (employee/admin),
  earnedLeaves: Number (default: 12),
  sickLeaves: Number (default: 12),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Leave Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  leaveType: String (earned/sick),
  fromDate: Date,
  toDate: Date,
  reason: String,
  status: String (pending/approved/rejected),
  adminComments: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 📝 User Roles & Access

### Employee
- Can view only their own leaves
- Can apply for new leaves
- Cannot access admin panel
- Can view analytics (limited)

### Admin
- Can view all leaves
- Can approve/reject leaves
- Can add comments
- Can view comprehensive analytics
- Cannot apply for leaves

## 🎨 UI/UX Highlights

- 🎪 Modern gradient design with purple/blue theme
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Smooth animations & transitions
- 🎯 Intuitive navigation
- ♿ Accessible UI components
- 🌙 Clean, professional interface
- 💫 Interactive modals & forms

## 🔧 Configuration

### Email Service Setup
1. Enable 2FA on Gmail
2. Generate App Password
3. Use App Password in `.env`

### MongoDB Setup
1. Create cluster on MongoDB Atlas
2. Create database user
3. Whitelist your IP
4. Copy connection string to `.env`

## 📊 Evaluation Scoring

- **Backend Development**: 30 Marks
- **Frontend Development**: 25 Marks
- **Feature Implementation**: 20 Marks
- **Code Quality**: 10 Marks
- **Deployment**: 10 Marks
- **UI/UX**: 5 Marks
- **Bonus Features**: +10 Marks

## 🚀 Deployment

### Deploy Frontend (Netlify/Vercel)
```bash
npm run build
# Then deploy build folder
```

### Deploy Backend (Render/Railway)
```bash
# Push to GitHub
# Connect repository to Render/Railway
# Set environment variables
# Deploy
```

## 📖 Best Practices Implemented

✅ JWT for secure authentication
✅ Bcryptjs for password security
✅ Validation at both frontend & backend
✅ Error handling throughout
✅ Responsive design
✅ Pagination for performance
✅ Search functionality
✅ Email notifications
✅ Role-based access control
✅ Clean code architecture
✅ Comments & documentation
✅ Professional UI/UX

## 🤝 Contributing

This is an evaluation project. Please follow best practices:
- Write clean, readable code
- Add comments for complex logic
- Use meaningful variable names
- Follow REST API conventions
- Test thoroughly before submission

## 📝 License

This project is created for evaluation purposes.

## 🙋 Support

For issues or questions, please refer to the documentation or contact the development team.

---

**Built with ❤️ using MERN Stack**
