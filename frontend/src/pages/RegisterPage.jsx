import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, UserPlus, Stethoscope, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const [role, setRole] = useState('patient');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Patient fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Doctor fields
  const [specialization, setSpecialization] = useState('General Medicine');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      username,
      email,
      password,
      role,
      full_name: fullName,
      age: age ? parseInt(age) : null,
      gender: role === 'patient' ? gender : null,
      emergency_contact: role === 'patient' ? emergencyContact : null,
      specialization: role === 'doctor' ? specialization : null,
      license_number: role === 'doctor' ? licenseNumber : null,
      hospital_affiliation: role === 'doctor' ? hospitalAffiliation : null,
    };

    try {
      const res = await register(payload);
      if (role === 'doctor') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create Account</h2>
            <p style={{ fontSize: '0.875rem' }}>Join the multimodal clinical assistant platform</p>
          </div>

          {/* Role Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`btn ${role === 'patient' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.65rem' }}
            >
              <UserPlus size={16} /> Patient Account
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`btn ${role === 'doctor' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.65rem' }}
            >
              <Stethoscope size={16} /> Doctor / Clinician
            </button>
          </div>

          {error && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#991b1b', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password (6+ chars)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  minLength={6} 
                  required 
                />
              </div>
            </div>

            {/* Patient Specific Fields */}
            {role === 'patient' && (
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    placeholder="e.g. 42" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={emergencyContact} 
                    onChange={(e) => setEmergencyContact(e.target.value)} 
                    placeholder="(555) 000-0000" 
                  />
                </div>
              </div>
            )}

            {/* Doctor Specific Fields */}
            {role === 'doctor' && (
              <>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Medical Specialization</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={specialization} 
                      onChange={(e) => setSpecialization(e.target.value)} 
                      placeholder="e.g. Pulmonology, Radiology" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Medical License Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={licenseNumber} 
                      onChange={(e) => setLicenseNumber(e.target.value)} 
                      placeholder="e.g. MD-12345" 
                      required 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Hospital / Clinic Affiliation</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={hospitalAffiliation} 
                    onChange={(e) => setHospitalAffiliation(e.target.value)} 
                    placeholder="e.g. Metro University Hospital" 
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} disabled={loading}>
              {loading ? 'Creating Profile...' : `Register as ${role === 'doctor' ? 'Doctor' : 'Patient'}`}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

