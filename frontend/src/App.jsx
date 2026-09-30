import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { ProtectedRoute } from './components/ProtectedRoute';

// Import All 17 Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserDashboard } from './pages/UserDashboard';
import { UploadReportPage } from './pages/UploadReportPage';
import { UploadImagePage } from './pages/UploadImagePage';
import { MultimodalAnalysisPage } from './pages/MultimodalAnalysisPage';
import { AnalysisResultPage } from './pages/AnalysisResultPage';
import { AIChatbotPage } from './pages/AIChatbotPage';
import { PatientHistoryPage } from './pages/PatientHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { DoctorPatientDetailsPage } from './pages/DoctorPatientDetailsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <DisclaimerBanner />
          <Navbar />
          
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Patient / General Authenticated Pages */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/upload-report" 
                element={
                  <ProtectedRoute>
                    <UploadReportPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/upload-image" 
                element={
                  <ProtectedRoute>
                    <UploadImagePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/multimodal-analysis" 
                element={
                  <ProtectedRoute>
                    <MultimodalAnalysisPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analysis/:id" 
                element={
                  <ProtectedRoute>
                    <AnalysisResultPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chatbot" 
                element={
                  <ProtectedRoute>
                    <AIChatbotPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <PatientHistoryPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />

              {/* Doctor Pages */}
              <Route 
                path="/doctor-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/patient/:id" 
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                    <DoctorPatientDetailsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Administrator Pages */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />

              {/* 404 Not Found Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

