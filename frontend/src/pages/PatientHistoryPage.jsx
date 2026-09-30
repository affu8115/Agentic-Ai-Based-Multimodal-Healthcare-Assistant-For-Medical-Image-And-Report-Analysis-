import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analysisService } from '../services/analysisService';
import { TriageBadge } from '../components/TriageBadge';
import { History, FileText, Image as ImageIcon, Trash2, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export const PatientHistoryPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await analysisService.getHistory();
      if (res.success) {
        setAnalyses(res.analyses);
      }
    } catch (err) {
      setError('Failed to retrieve personal medical history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you wish to delete Clinical Analysis record #${id}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await analysisService.deleteAnalysis(id);
      if (res.success) {
        setSuccessMsg(`Analysis record #${id} removed successfully.`);
        setAnalyses(analyses.filter(a => a.id !== id));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1>Patient Medical History</h1>
          <p>Chronological record of your multimodal uploads, AI evaluations, and clinical reviews.</p>
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
            marginBottom: '1.5rem' 
          }}>
            {successMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading records...
          </div>
        ) : analyses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {analyses.map((item) => (
              <div key={item.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>Analysis #{item.id}</span>
                      <TriageBadge level={item.triage_level} color={item.triage_color} />
                      <span className="badge badge-blue">{item.analysis_type.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
                      <Clock size={14} /> Uploaded on {new Date(item.created_at).toLocaleString()}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '700px', marginBottom: '0.5rem' }}>
                      {item.overall_summary ? item.overall_summary.slice(0, 180) + '...' : 'No summary generated.'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
                      {item.doctor_review ? (
                        <span className="badge badge-emerald">Doctor Reviewed</span>
                      ) : (
                        <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Pending Review</span>
                      )}
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ color: 'var(--text-muted)' }}>Confidence: {Math.round(item.confidence_score * 100)}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link to={`/analysis/${item.id}`} className="btn btn-primary btn-sm">
                      View Dossier <ArrowRight size={14} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#ef4444' }}
                      title="Delete record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <History size={48} color="var(--primary)" style={{ opacity: 0.4, margin: '0 auto 1rem' }} />
            <h3>No Medical Analyses On Record</h3>
            <p style={{ maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
              Upload your medical reports or images to conduct an automated multimodal analysis.
            </p>
            <Link to="/multimodal-analysis" className="btn btn-primary">Start New Analysis</Link>
          </div>
        )}
      </div>
    </div>
  );
};

