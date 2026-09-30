import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { TriageBadge } from '../components/TriageBadge';
import { 
  Stethoscope, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ArrowLeft,
  Cpu,
  User,
  ShieldCheck
} from 'lucide-react';

export const DoctorPatientDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('reviewed');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await doctorService.getPatientAnalysis(id);
        if (res.success) {
          setData(res);
          if (res.analysis?.doctor_review) {
            setClinicalNotes(res.analysis.doctor_review.clinical_notes || '');
            setReviewStatus(res.analysis.doctor_review.review_status || 'reviewed');
          }
        }
      } catch (err) {
        setError('Failed to fetch patient clinical details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!clinicalNotes.trim()) {
      setError('Please provide clinical notes before signing off on this analysis.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await doctorService.submitReview(id, clinicalNotes, reviewStatus);
      if (res.success) {
        setSuccessMsg('Clinical review and verification signed off successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit clinical review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Stethoscope size={40} color="var(--primary)" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <h2>Loading Clinical Record...</h2>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="main-content">
        <div className="card" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>Record Not Found</h2>
          <p style={{ margin: '1rem 0' }}>{error}</p>
          <Link to="/doctor-dashboard" className="btn btn-primary">Return to Doctor Queue</Link>
        </div>
      </div>
    );
  }

  const analysis = data?.analysis;
  const patient = data?.patient;

  return (
    <div className="main-content">
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Navigation back */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/doctor-dashboard" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Back to Patient Queue
          </Link>
        </div>

        {/* Patient Demographic Banner */}
        <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '52px', 
                height: '52px', 
                borderRadius: '50%', 
                background: '#e0f2fe', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <User size={26} color="var(--primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{patient?.full_name}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Demographics: <strong>{patient?.age ? `${patient.age} yrs` : 'Age N/A'}, {patient?.gender || 'Unspecified'}</strong> • Contact: {patient?.contact_number || 'N/A'}
                </div>
                {patient?.medical_notes && (
                  <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.35rem' }}>
                    Notes: {patient.medical_notes}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Triage Urgency:</span>
                <TriageBadge level={analysis?.triage_level} color={analysis?.triage_color} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                Submitted: {new Date(analysis?.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            color: '#991b1b', 
            padding: '0.85rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem' 
          }}>
            {error}
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

        {/* AI Synthesis Summary Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={20} color="var(--primary)" /> AI Multi-Agent Synthesized Findings
          </h3>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            {analysis?.overall_summary}
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '0.65rem 0.9rem', borderRadius: '6px' }}>
            Heuristic Confidence Score: {Math.round((analysis?.confidence_score || 0.85) * 100)}% • Engine: {analysis?.ai_provider}
          </div>
        </div>

        {/* Raw Files Side-by-Side (Scans & OCR) */}
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          {analysis?.image_file && (
            <div className="card">
              <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={18} color="var(--accent)" /> Patient Medical Scan
              </h4>
              <div style={{ background: '#0f172a', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                <img 
                  src={`/api/files/${analysis.image_file.id}`} 
                  alt="Medical scan" 
                  style={{ maxHeight: '240px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          {analysis?.report_file?.report_data && (
            <div className="card">
              <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={18} color="var(--primary)" /> Extracted Laboratory Report Text
              </h4>
              <div style={{ 
                background: '#f8fafc', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                maxHeight: '240px', 
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                border: '1px solid var(--border-color)'
              }}>
                {analysis.report_file.report_data.extracted_text}
              </div>
            </div>
          )}
        </div>

        {/* Doctor Verification & Sign-off Card */}
        <div className="card" style={{ border: '2px solid var(--primary)', background: '#ffffff' }}>
          <div className="card-header" style={{ borderColor: 'var(--primary-light)' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)' }}>
                <Stethoscope size={22} color="var(--primary)" /> Physician Clinical Review & Sign-Off
              </h3>
              <p style={{ fontSize: '0.825rem' }}>
                Provide certified clinical verification notes to override or validate the AI recommendations for the patient.
              </p>
            </div>
            {analysis?.doctor_review && (
              <span className="badge badge-emerald">Signed Off</span>
            )}
          </div>

          <form onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label className="form-label">Professional Clinical Notes / Recommendations</label>
              <textarea 
                className="form-textarea"
                placeholder="Enter clinical impression, differential diagnosis, patient instructions, or confirmatory test orders..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                style={{ minHeight: '140px', fontSize: '0.95rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Review Status:</label>
                <select 
                  className="form-select" 
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="reviewed">Approved / Clinically Reviewed</option>
                  <option value="amended">Amended with Diagnostic Corrections</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || !clinicalNotes.trim()}
              >
                <Save size={16} /> {submitting ? 'Saving Review...' : 'Sign Off & Save Notes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

