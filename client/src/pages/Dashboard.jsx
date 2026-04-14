// client/src/pages/Dashboard.jsx
// CHANGE: Added RETDashboard for role === 'ret'
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import FacultyDashboard from '../components/dashboard/FacultyDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import RETDashboard from '../components/dashboard/RETDashboard'; // NEW
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'faculty') return <FacultyDashboard />;
  if (user.role === 'ret') return <RETDashboard />; // NEW
  return <StudentDashboard />;
};

export default Dashboard;