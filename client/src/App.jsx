// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleSelect from './pages/RoleSelect';
import StudentLogin from './components/auth/StudentLogin';
import FacultyLogin from './components/auth/FacultyLogin';
import AdminLogin from './components/auth/AdminLogin';
import Register from './components/auth/Register';
import Home from './pages/Home';
import About from './pages/About';
import Help from './pages/Help';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import ResearchDetail from './pages/ResearchDetail';
import Notifications from './pages/Notifications';
import Layout from './components/layout/Layout';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
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

            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><Layout><Explore /></Layout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
            <Route path="/research/:id" element={<ProtectedRoute><Layout><ResearchDetail /></Layout></ProtectedRoute>} />

            {/* Redirects for old routes */}
            <Route path="/browse" element={<Navigate to="/explore" replace />} />
            <Route path="/search" element={<Navigate to="/explore" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;