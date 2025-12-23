# 📊 ConServe - Project Context

## 🎯 Project Overview
**ConServe** is a secure research repository system for NEUST College of Nursing featuring role-based access control, PDF protection with dynamic watermarking, and comprehensive research management workflows.

**Stack**: MERN (MongoDB, Express.js, React, Node.js)  
**Status**: 85% Complete (Phase 7 - Security & Optimization in progress)

---

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: React 18 + Vite + TailwindCSS + Dark Mode
- **Backend**: Express.js + JWT Authentication
- **Database**: MongoDB Atlas (GridFS for PDF storage)
- **Storage**: Cloudinary (logos/images)
- **Email**: Nodemailer (Gmail SMTP)

### Key Dependencies
**Backend**: express, mongoose, bcryptjs, jsonwebtoken, cloudinary, multer, nodemailer, express-validator, express-rate-limit, helmet, compression, winston  
**Frontend**: react-router-dom, axios, lucide-react, recharts, pdfjs-dist, tailwindcss

---

## 👥 User Roles & Permissions

### 🎓 Students
- Submit research papers (IMRaD format PDF)
- Browse approved research
- Bookmark favorites
- View submission status & reviews
- Access protected PDFs with watermarks

### 👨‍🏫 Faculty
- All student permissions
- Provide reviews with ratings (methodology, clarity, contribution, overall: 1-5 scale)
- Submit research papers
- View pending submissions

### 🛡️ Admin
- Approve/reject user accounts
- Approve/reject/request revision for research papers
- Manage valid student/faculty IDs
- Configure system settings (logos, features, security)
- View analytics & audit logs
- Final decision authority on all submissions

---

## 🔐 Security Features

### Authentication & Authorization
- JWT tokens (7-day expiry, configurable)
- Bcrypt password hashing (12 rounds)
- Password requirements: 12+ chars, uppercase, lowercase, number, special character
- Password history tracking (last 5 passwords)
- Account lockout: 5 failed attempts → 30 minutes
- Auto-logout after 20 minutes inactivity
- Role-based access control (RBAC)

### PDF Protection
- **Dynamic Watermarking**: `email • ID • date time` on every page
- **Signed URLs**: JWT-based, 1-hour expiry, GridFS streaming
- **Disabled Features**: Downloads, prints, right-click, copy
- **Blocked Shortcuts**: Ctrl+S, Ctrl+P, F12, PrintScreen
- **Violation Logging**: All protection bypass attempts tracked

### API Security
- Rate limiting: Login (5/15min), API (100/15min)
- Helmet.js security headers
- CORS configuration
- Input validation (express-validator)
- IP address + User Agent logging
- Compression middleware

### Data Privacy (RA 10173 Compliant)
- Audit logging for all critical operations
- User consent tracking
- Data retention policies
- Privacy policy & terms displayed
- Right to access, rectify, delete data

---

## 📝 Research Workflow

### Submission Process
1. **Upload**: Student/Faculty uploads IMRaD format PDF (10MB max) with metadata
2. **Metadata**: Title, authors, co-authors, abstract, keywords, category, subject area, year completed
3. **Validation**: PDF format check, file size limit, required fields
4. **Admin Review**: Approve, Reject, or Request Revision
5. **Faculty Review** (Optional): Provide suggestions with ratings
6. **Notification**: Email + in-app notifications to author
7. **Publication**: Approved papers visible to authenticated users

### Review System
- Multi-criteria ratings (1-5 scale)
- Comments & revision requests with deadlines
- Review history tracking
- Email notifications with HTML templates
- Faculty suggestions sent to admin for final decision

---

## 🔍 Core Features

### User Management
- **Valid ID System**: Admin-managed lists of valid student/faculty IDs
- Registration requires valid ID verification
- Admin approval workflow
- Account suspension/reactivation
- Role assignment & modification

### Research Features
- **Advanced Search**: By title, author, keywords, year completed, subject area, category, status (admin only)
- **Filters**: Category (Completed/Published), Year (1975-2025), Subject Area (12 nursing specialties), Author name
- **Citation Generator**: APA, MLA, Chicago, Harvard with click tracking
- **Bookmarks**: Save favorite papers
- **View Tracking**: Recently viewed + trending papers
- **Analytics**: Per-paper view counts, citation stats, bookmark counts

### Notification System
- **In-App**: Bell icon with unread badge, dropdown with recent notifications
- **Email**: HTML templates for all major events
- **Types**: Research status changes, account approval, faculty reviews, new submissions, system updates
- **Features**: Mark as read, delete, auto-delete after 30 days, priority levels

### Settings Management (Admin)
- **Logos**: Upload school, college, ConServe logos via Cloudinary
- **Features**: Toggle registration, approval requirements, notifications, maintenance mode
- **Security**: Configure max login attempts, session timeout, password length
- **General**: Site name, description, theme colors

### Analytics Dashboard (Admin)
- Real-time stats: Total papers, users, views, pending approvals
- Monthly submission trends (line chart with Recharts)
- Top viewed papers (last 5)
- Recent submissions (last 5)
- Activity logs viewer with filters
- Citation statistics by style

---

## 💾 Database Schema

### User Model
```javascript
{
  firstName, lastName, email, studentId, password, role,
  isApproved, isActive, twoFactorEnabled,
  loginAttempts, lockoutUntil, passwordHistory[5],
  lastLogin, createdAt, updatedAt
}
// Indexes: email (unique), studentId (unique)
```

### Research Model
```javascript
{
  title, authors[], coAuthors[], abstract, keywords[],
  category, subjectArea, yearCompleted,
  fileUrl, fileName, fileSize, gridfsId,
  status, submittedBy, reviewedBy, revisionNotes,
  views, bookmarks, citations,
  analytics: { viewsByDate, citationsByStyle },
  recentViews[], createdAt, updatedAt
}
// Indexes: status, submittedBy, yearCompleted, subjectArea, text(title, abstract, keywords)
```

### Review Model
```javascript
{
  research, reviewer, decision,
  comments, ratings: { methodology, clarity, contribution, overall },
  revisionRequested, revisionDeadline, createdAt
}
```

### Notification Model
```javascript
{
  recipient, type, title, message, link,
  relatedResearch, relatedUser,
  isRead, priority, createdAt
}
// Auto-delete after 30 days
```

### ValidStudentId / ValidFacultyId Model
```javascript
{
  studentId/facultyId, fullName,
  course/department, yearLevel/position, email,
  status, isUsed, registeredUser, addedBy, createdAt
}
// Indexes: studentId/facultyId (unique)
```

### Settings Model
```javascript
{
  siteName, siteDescription,
  logos: { school, college, conserve },
  theme: { primaryColor, accentColor },
  features: { allowRegistration, requireApproval, enableNotifications, maintenanceMode },
  security: { maxLoginAttempts, sessionTimeout, passwordMinLength },
  updatedBy, createdAt, updatedAt
}
// Single document pattern
```

### Bookmark Model
```javascript
{
  user, research, createdAt
}
// Unique compound index: user + research
```

### AuditLog Model
```javascript
{
  user, action, resource, resourceId,
  ipAddress, userAgent, details, timestamp
}
// Indexes: user + timestamp, action + timestamp
```

### TeamMember Model
```javascript
{
  name, role, imageUrl, cloudinaryId,
  order, isActive, createdAt, updatedAt
}
```

---

## 🎨 UI/UX Features

### Design System
- **Colors**: Navy (#1e3a8a), Accent (#60a5fa), 50-950 shades
- **Dark Mode**: Persistent via localStorage, system-wide toggle
- **Animations**: fade-in (0.4s), slide-up (0.5s), scale-in (0.3s)
- **Icons**: Lucide React (600+ icons)
- **Typography**: Inter font family
- **Responsive**: Mobile-first, breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)

### Components
- **Toast Notifications**: Auto-dismiss (3-5s), success/error/warning/info types
- **Modals**: Confirmation dialogs, PDF viewer, citation generator, review forms, team management
- **Loading States**: Spinners, disabled buttons, skeleton screens
- **Forms**: Real-time validation, strength indicators, error messages
- **Charts**: Line charts, bar charts (Recharts)
- **PDF Viewer**: Full-screen, zoom, page navigation, watermarked

### Pages
- **Public**: Home, About, Help, Terms, Privacy, Browse (auth required)
- **Auth**: Login (role-based), Register, Role Selection
- **Dashboard**: Student, Faculty, Admin (role-specific)
- **Research**: Detail view, submission wizard (3 steps)
- **Notifications**: Inbox with filters, mark as read/delete

---

## 📧 Email System

### Templates (HTML)
1. **Welcome Email**: Sent on registration, pending approval notice
2. **Account Approved**: Login instructions, dashboard link
3. **Research Approved**: Congratulations, view paper link
4. **Research Rejected**: Reason, resubmission instructions
5. **Revision Requested**: Feedback, deadline, submission link
6. **Faculty Review Received**: Author notification, view review link
7. **Admin Alerts**: New user registration, new research submission

### Configuration
- Provider: Gmail SMTP
- Port: 587 (TLS)
- Authentication: App Password (not regular password)
- Retry logic: 3 attempts with exponential backoff
- Queue: None (synchronous, non-blocking for failures)

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register with valid ID verification
- `POST /login` - JWT login, returns token + user
- `POST /logout` - Audit log logout
- `GET /me` - Get current authenticated user

### Research (`/api/research`)
- `GET /` - List with filters (search, category, year, subject, author, status)
- `GET /:id` - Get paper details with signed PDF URL
- `GET /view/:fileId` - Stream PDF with JWT token verification
- `POST /` - Submit research (multipart: PDF + metadata)
- `PATCH /:id/status` - Admin/Faculty approve/reject/revision
- `DELETE /:id` - Admin delete paper
- `GET /my-submissions` - User's submitted papers
- `GET /recently-viewed` - Last 100 viewed papers
- `GET /trending` - Most viewed papers
- `GET /:id/citation` - Generate citation (style param)
- `POST /log-violation` - Log security violations

### Users (`/api/users`) - Admin Only
- `GET /` - List all users (filter by status, role)
- `GET /stats` - User statistics
- `GET /:id` - Get user details
- `PATCH /:id/approve` - Approve pending user
- `DELETE /:id/reject` - Delete/reject user
- `PATCH /:id/role` - Update user role
- `PATCH /:id/toggle-status` - Activate/deactivate

### Valid IDs (`/api/valid-student-ids`, `/api/valid-faculty-ids`)
- `GET /check/:id` - **PUBLIC** Verify ID validity
- `GET /` - Admin list all
- `POST /` - Admin add new ID
- `DELETE /:id` - Admin delete unused ID

### Reviews (`/api/reviews`)
- `POST /` - Faculty/Admin submit review
- `GET /:researchId` - Get reviews for paper
- `GET /my-reviews` - User's submitted reviews
- `GET /pending` - Pending papers for review
- `GET /stats` - Review statistics

### Bookmarks (`/api/bookmarks`)
- `POST /toggle/:researchId` - Toggle bookmark
- `GET /my-bookmarks` - User's bookmarked papers
- `GET /check/:researchId` - Check if bookmarked

### Analytics (`/api/analytics`) - Admin Only
- `GET /dashboard` - Dashboard stats (papers, users, views, monthly data)
- `GET /activity-logs` - Audit logs with pagination
- `GET /user-analytics` - User-specific stats

### Settings (`/api/settings`)
- `GET /` - **PUBLIC** Get system settings (logos, site name)
- `PATCH /` - Admin update settings
- `POST /logo/:type` - Admin upload logo (school/college/conserve)

### Notifications (`/api/notifications`)
- `GET /` - Get user's notifications (limit param)
- `GET /unread-count` - Unread notification count
- `PATCH /:id/read` - Mark notification as read
- `PATCH /mark-all-read` - Mark all as read
- `DELETE /:id` - Delete notification
- `DELETE /clear-read/all` - Clear all read notifications

### Team (`/api/team`)
- `GET /` - **PUBLIC** Get team members
- `POST /` - Admin add team member
- `PATCH /:id` - Admin update team member
- `DELETE /:id` - Admin delete team member

---

## 🚀 Deployment

### Environment Variables

**Backend (.env)**
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=64_char_random_string
JWT_EXPIRE=7d
CLIENT_URL=https://frontend.vercel.app
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=gmail_app_password
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=30
```

**Frontend (.env)**
```env
VITE_API_URL=https://backend.onrender.com/api
```

### Hosting Recommendations
- **Frontend**: Vercel (auto-deploy from GitHub)
- **Backend**: Render or Railway (free tier available)
- **Database**: MongoDB Atlas (free M0 cluster)
- **Storage**: Cloudinary (free tier: 25GB storage, 25GB bandwidth/month)

### Deployment Steps
1. **MongoDB Atlas**: Create cluster, whitelist 0.0.0.0/0, get connection string
2. **Cloudinary**: Sign up, get API credentials
3. **Gmail**: Generate App Password (not regular password)
4. **Backend Deploy**: 
   - Push to GitHub
   - Connect Render/Railway
   - Set environment variables
   - Deploy
5. **Frontend Deploy**:
   - Update VITE_API_URL
   - Push to GitHub
   - Connect Vercel
   - Deploy

---

## 🐛 Known Issues & Solutions

### PDF Viewer
**Issue**: Worker initialization errors  
**Solution**: Use cdnjs.cloudflare.com for pdf.worker.js, create blob URL for worker

### Trust Proxy
**Issue**: Incorrect IP logging in production  
**Solution**: Enable `app.set('trust proxy', 1)` BEFORE all middleware

### Email Failures
**Issue**: Gmail blocks login  
**Solution**: Use Gmail App Password, not regular password. Enable 2-step verification first.

### GridFS File Not Found
**Issue**: PDF streaming fails  
**Solution**: Ensure MongoDB connection is stable, verify GridFS bucket initialization

### Dark Mode Flash
**Issue**: Brief light mode flash on page load  
**Solution**: Initialize theme from localStorage before React mount

---

## 📊 Performance Optimizations

### Backend
- MongoDB indexes on frequently queried fields
- Compression middleware (gzip)
- Rate limiting to prevent abuse
- Pagination (default limit: 50)
- GridFS streaming (no memory buffering)

### Frontend
- Code splitting (React.lazy)
- Image optimization (Cloudinary transformations)
- Lazy loading components
- Debounced search inputs
- Memoized expensive calculations

### Database
```javascript
// Indexes
User: email (unique), studentId (unique)
Research: status, submittedBy, yearCompleted, subjectArea, text(title, abstract, keywords)
Review: research, reviewer
Bookmark: user + research (compound unique)
AuditLog: user + timestamp, action + timestamp
Notification: recipient + isRead + createdAt
```

---

## 📈 Project Progress

### ✅ Completed (85%)
- Core authentication & authorization
- User management with approval workflow
- Research submission & review system
- PDF protection with watermarking
- Citation generator with tracking
- Bookmarks & favorites
- Analytics dashboard with charts
- Activity logs & audit trails
- Settings management
- Notification system (in-app + email)
- Team management
- Dark mode
- Valid ID verification system

### 🔄 In Progress (15%)
- 2FA authentication (Speakeasy + QR code)
- Enhanced testing suite
- Mobile responsiveness refinements
- Performance optimizations
- Documentation completion

### 🔮 Future Enhancements (Not Planned)
- AI-powered tag suggestions
- Plagiarism detection
- PWA/offline mode
- Multi-language support
- Version history for papers
- Batch operations
- Advanced analytics (heatmaps)
- Real-time collaborative editing

---

## 🔒 Security Compliance

### RA 10173 (Data Privacy Act of 2012)
- ✅ Privacy policy displayed prominently
- ✅ User consent obtained during registration
- ✅ Data retention policies defined
- ✅ Right to access, rectify, delete data
- ✅ Data minimization (collect only necessary data)
- ✅ Audit logging for accountability
- ✅ Secure data transmission (TLS/SSL)
- ✅ Role-based access control
- ✅ Data breach notification procedures (defined)
- ✅ DPO contact information provided

### Best Practices
- HTTPS enforced in production
- Password hashing (bcrypt, cost factor 12)
- JWT with reasonable expiry
- Input validation & sanitization
- SQL injection prevention (Mongoose ORM)
- XSS prevention (React auto-escapes)
- CSRF protection (JWT-based)
- Rate limiting
- Security headers (Helmet.js)

---

## 📚 Documentation Files

### Repository Structure
```
conserve/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── context/       # React Context (Auth, Theme)
│   │   ├── styles/        # Global CSS
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   ├── .env.example       # Environment template
│   ├── .gitignore         # Git ignore rules
│   ├── package.json       # Dependencies
│   ├── vite.config.js     # Vite configuration
│   └── tailwind.config.js # Tailwind configuration
│
├── server/                # Backend (Express.js)
│   ├── src/
│   │   ├── config/        # DB, Cloudinary, GridFS config
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth, validation, rate limiting
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Email, citation, logger, signed URLs
│   │   └── scripts/       # Admin creation script
│   ├── logs/              # Winston logs (gitignored)
│   ├── .env.example       # Environment template
│   ├── .gitignore         # Git ignore rules
│   ├── package.json       # Dependencies
│   └── server.js          # Entry point
│
├── PROJECT_CONTEXT.md     # This file
└── README.md              # Project README
```

---

## 🆘 Support & Maintenance

### Admin Contacts
- **Email**: conserve2025@gmail.com
- **Response Time**: Within 48 hours
- **Support Hours**: 9AM-5PM (Manila Time, Monday-Friday)

### National Privacy Commission
- **Address**: 5th Floor, PICC, Pasay City, Metro Manila, Philippines
- **Email**: info@privacy.gov.ph
- **Hotline**: (+63 2) 8234-2228

### Technical Support
For technical issues, users should:
1. Check Help page first
2. Contact support via email
3. Include: account email, issue description, screenshots (if applicable)
4. Expected response: 24-48 hours

---

## 📝 Development Guidelines

### Code Style
- **JavaScript**: ES6+ features, async/await over callbacks
- **React**: Functional components with hooks
- **CSS**: Tailwind utility classes, dark mode support
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic

### Git Workflow
```bash
# Feature branches
git checkout -b feature/feature-name
git commit -m "feat: add feature description"
git push origin feature/feature-name

# Bug fixes
git checkout -b fix/bug-description
git commit -m "fix: resolve issue description"

# Commit message format
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructuring
# test: adding tests
# chore: maintenance
```

### Testing
```bash
# Backend (Not implemented yet)
npm test

# Frontend (Not implemented yet)
npm run test
```

---

## 🎯 Success Metrics

### User Adoption
- Target: 200+ registered users in first semester
- Target: 500+ research papers uploaded in first year

### System Performance
- Page load time: <3 seconds
- API response time: <500ms
- Uptime: >99.5%

### Security
- Zero data breaches
- <1% false positive on ID verification
- All security violations logged and reviewed

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainers**: NEUST College of Nursing IT Team  
**License**: Proprietary (NEUST Internal Use Only)

---

## 🔗 Quick Links
- **Live Site**: [To be deployed]
- **API Docs**: [To be created]
- **Admin Panel**: `/dashboard` (admin role required)
- **Support**: conserve2025@gmail.com