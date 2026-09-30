import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/doctorService';
import { TriageBadge } from '../components/TriageBadge';
import { Stethoscope, Users, CheckCircle2, Clock, AlertTriangle, ArrowRight, Search } from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending_review, reviewed
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientCases = async () => {
      try {
        const res = await doctorService.getPatients();
        if (res.success) {
          setPatients(res.patients);
        }
      } catch (err) {
        setError('Failed to fetch clinical review queue.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientCases();
  }, []);

  const doctorName = user?.profile?.full_name || `Dr. ${user?.username}`;
  const specialization = user?.profile?.specialization || 'Clinical Specialist';

  // Computed statistics
  const totalCases = patients.length;
  const pendingCases = patients.filter(p => p.review_status === 'pending_review').length;
  const reviewedCases = patients.filter(p => p.review_status === 'reviewed').length;
  const urgentCases = patients.filter(p => p.triage_level?.includes('Tier 3') || p.triage_level?.includes('Tier 4')).length;

  const filteredPatients = patients.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.review_status === filterStatus;
    const matchesSearch = p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.triage_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(p.analysis_id).includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="main-content">
      {/* Clinician Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '2rem 2.5rem', 
        color: 'white',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Stethoscope size={22} color="#38bdf8" />
              <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                Physician Clinical Portal
              </span>
            </div>
            <h1 style={{ color: 'white', fontSize: '1.85rem', marginBottom: '0.25rem' }}>
              {doctorName}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {specialization} • License: {user?.profile?.license_number || 'MD-ACTIVE'} • {user?.profile?.hospital_affiliation || 'Clinical Network'}
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Decision-Support Mode</div>
            <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '1rem' }}>Clinical Sign-Off Ready</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#e0f2fe', borderRadius: '8px' }}>
              <Users size={20} color="#0284c7" />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{totalCases}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Analyses</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#fffbeb', borderRadius: '8px' }}>
              <Clock size={20} color="#d97706" />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{pendingCases}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Review</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#f0fdf4', borderRadius: '8px' }}>
              <CheckCircle2 size={20} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{reviewedCases}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clinically Signed Off</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#fff7ed', borderRadius: '8px' }}>
              <AlertTriangle size={20} color="#ea580c" />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{urgentCases}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority Triage (Tier 3/4)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Queue Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Patient Clinical Queue</h3>
            <p style={{ fontSize: '0.85rem' }}>Select any record to inspect raw scans, OCR text, and AI observations.</p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search patient or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', width: '200px' }}
              />
            </div>

            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading clinical queue...</div>
        ) : filteredPatients.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Analysis ID</th>
                  <th>Patient Name</th>
                  <th>Demographics</th>
                  <th>Modality</th>
                  <th>Triage Urgency</th>
                  <th>Submitted At</th>
                  <th>Clinical Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.analysis_id}>
                    <td style={{ fontWeight: 700 }}>#{p.analysis_id}</td>
                    <td style={{ fontWeight: 600 }}>{p.patient_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {p.patient_age ? `${p.patient_age} yrs` : 'N/A'}, {p.patient_gender || 'Unspecified'}
                    </td>
                    <td>
                      <span className="badge badge-blue">{p.analysis_type.toUpperCase()}</span>
                    </td>
                    <td>
                      <TriageBadge level={p.triage_level} color={p.triage_color} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {p.review_status === 'reviewed' ? (
                        <span className="badge badge-emerald">Signed Off</span>
                      ) : (
                        <span className="badge badge-amber">Awaiting Review</span>
                      )}
                    </td>
                    <td>
                      <Link 
                        to={`/doctor/patient/${p.analysis_id}`} 
                        className="btn btn-primary btn-sm"
                      >
                        Review Case <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No patient cases matching the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};

