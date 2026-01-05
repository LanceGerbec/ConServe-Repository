import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Lazy load route components
const RoleSelect = lazy(() => import('./pages/RoleSelect'));
const StudentLogin = lazy(() => import('./components/auth/StudentLogin'));
const FacultyLogin = lazy(() => import('./components/auth/FacultyLogin'));
const AdminLogin = lazy(() => import('./components/auth/AdminLogin'));
const Register = lazy(() => import('./components/auth/Register'));
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Help = lazy(() => import('./pages/Help'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Explore = lazy(() => import('./pages/Explore'));
const ResearchDetail = lazy(() => import('./pages/ResearchDetail'));
const Notifications = lazy(() => import('./pages/Notifications'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/help" element={<Layout><Help /></Layout>} />
              <Route path="/terms" element={<Layout><Terms /></Layout>} />
              <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
              
              <Route path="/login" element={<RoleSelect />} />
              <Route path="/login/student" element={<StudentLogin />} />
              <Route path="/login/faculty" element={<FacultyLogin />} />
              <Route path="/login/admin" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={lazy(() => import('./pages/ForgotPassword'))()} />
              <Route path="/reset-password" element={lazy(() => import('./pages/ResetPassword'))()} />  

              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/explore" element={<ProtectedRoute><Layout><Explore /></Layout></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
              <Route path="/research/:id" element={<ProtectedRoute><Layout><ResearchDetail /></Layout></ProtectedRoute>} />

              <Route path="/browse" element={<Navigate to="/explore" replace />} />
              <Route path="/search" element={<Navigate to="/explore" replace />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;