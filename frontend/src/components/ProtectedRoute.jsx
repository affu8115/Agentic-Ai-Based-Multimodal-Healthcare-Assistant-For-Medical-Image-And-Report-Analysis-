import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>Verifying Session...</div>
          <p style={{ color: 'var(--text-muted)' }}>Connecting to healthcare security services</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="main-content">
        <div className="card" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>Access Restricted</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Your account role (<strong>{user?.role}</strong>) is not authorized to view this clinical portal.
          </p>
          <a href="/" className="btn btn-primary">Return to Safety</a>
        </div>
      </div>
    );
  }

  return children;
};

