/**
 * Navbar Component
 * Clean code: reusable navigation bar
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">
                NoteGenius
              </span>
            </Link>

            <div className="hidden md:flex space-x-4">
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/courses">Courses</NavLink>
              <NavLink to="/flashcards">Flashcards</NavLink>
              <NavLink to="/review">Review</NavLink>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );
}
