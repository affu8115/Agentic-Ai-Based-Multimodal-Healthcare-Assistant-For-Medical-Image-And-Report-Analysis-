import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  FileText, 
  Image as ImageIcon, 
  Cpu, 
  MessageSquare, 
  History, 
  User, 
  LogOut, 
  Shield, 
  Stethoscope,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isPatient, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Activity size={26} color="#0284c7" />
          <span>MedAgent<span style={{ color: '#0d9488' }}>AI</span></span>
        </Link>

        {/* Desktop Links */}
        <nav className="navbar-links" style={{ display: 'flex' }}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
            About
          </Link>

          {isAuthenticated && isPatient && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/upload-report" className={`nav-link ${isActive('/upload-report') ? 'active' : ''}`}>
                <FileText size={16} /> Report
              </Link>
              <Link to="/upload-image" className={`nav-link ${isActive('/upload-image') ? 'active' : ''}`}>
                <ImageIcon size={16} /> Image
              </Link>
              <Link to="/multimodal-analysis" className={`nav-link ${isActive('/multimodal-analysis') ? 'active' : ''}`}>
                <Cpu size={16} /> Analyze
              </Link>
              <Link to="/chatbot" className={`nav-link ${isActive('/chatbot') ? 'active' : ''}`}>
                <MessageSquare size={16} /> Chat
              </Link>
              <Link to="/history" className={`nav-link ${isActive('/history') ? 'active' : ''}`}>
                <History size={16} /> History
              </Link>
            </>
          )}

          {isAuthenticated && isDoctor && (
            <>
              <Link to="/doctor-dashboard" className={`nav-link ${isActive('/doctor-dashboard') ? 'active' : ''}`}>
                <Stethoscope size={16} /> Doctor Portal
              </Link>
              <Link to="/chatbot" className={`nav-link ${isActive('/chatbot') ? 'active' : ''}`}>
                <MessageSquare size={16} /> Medical AI
              </Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link to="/admin-dashboard" className={`nav-link ${isActive('/admin-dashboard') ? 'active' : ''}`}>
                <Shield size={16} /> Admin Console
              </Link>
              <Link to="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
                Settings
              </Link>
            </>
          )}
        </nav>

        {/* User / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" className="btn btn-outline btn-sm" title="View Profile">
                <User size={15} />
                <span>{user?.username}</span>
                <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {user?.role}
                </span>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Sign Out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

