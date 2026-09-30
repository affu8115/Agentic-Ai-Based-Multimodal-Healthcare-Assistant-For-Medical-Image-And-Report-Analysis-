import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, CheckCircle2, AlertCircle, Save, Shield } from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const profile = user?.profile || {};

  const [fullName, setFullName] = useState(profile.full_name || user?.username || '');
  const [age, setAge] = useState(profile.age || '');
  const [gender, setGender] = useState(profile.gender || 'Male');
  const [contactNumber, setContactNumber] = useState(profile.contact_number || '');
  const [emergencyContact, setEmergencyContact] = useState(profile.emergency_contact || '');
  const [medicalNotes, setMedicalNotes] = useState(profile.medical_notes || '');

  // Doctor fields
  const [specialization, setSpecialization] = useState(profile.specialization || '');
  const [licenseNumber, setLicenseNumber] = useState(profile.license_number || '');
  const [hospitalAffiliation, setHospitalAffiliation] = useState(profile.hospital_affiliation || '');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setError('');

    const payload = {
      full_name: fullName,
      contact_number: contactNumber,
      age: age ? parseInt(age) : null,
      gender,
      emergency_contact: emergencyContact,
      medical_notes: medicalNotes,
      specialization,
      license_number: licenseNumber,
      hospital_affiliation: hospitalAffiliation
    };

    try {
      const res = await authService.updateProfile(payload);
      if (res.success) {
        setSuccessMsg('Profile information updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1>User Profile & Settings</h1>
          <p>Manage your account identity, clinical baseline information, and contact preferences.</p>
        </div>

        {error && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            color: '#991b1b', 
            padding: '0.85rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ 
            background: '#ecfdf5', 
            border: '1px solid #a7f3d0', 
            color: '#065f46', 
            padding: '0.85rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: 'var(--primary-light)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <User size={28} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>{fullName || user?.username}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>{user?.email}</span>
                <span>•</span>
                <span className="badge badge-blue">{user?.role?.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdate}>
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
                <label className="form-label">Contact Phone</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={contactNumber} 
                  onChange={(e) => setContactNumber(e.target.value)} 
                  placeholder="(555) 123-4567" 
                />
              </div>
            </div>

            {user?.role === 'patient' && (
              <>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={age} 
                      onChange={(e) => setAge(e.target.value)} 
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
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Baseline Health / Medical Notes</label>
                  <textarea 
                    className="form-textarea" 
                    value={medicalNotes} 
                    onChange={(e) => setMedicalNotes(e.target.value)}
                    placeholder="List existing chronic conditions, medications, or allergies..." 
                    style={{ minHeight: '90px' }}
                  />
                </div>
              </>
            )}

            {user?.role === 'doctor' && (
              <>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Medical Specialization</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={specialization} 
                      onChange={(e) => setSpecialization(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={licenseNumber} 
                      onChange={(e) => setLicenseNumber(e.target.value)} 
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
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving Updates...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

