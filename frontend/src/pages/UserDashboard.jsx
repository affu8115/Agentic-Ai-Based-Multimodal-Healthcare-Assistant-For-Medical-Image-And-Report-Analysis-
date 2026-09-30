import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analysisService } from '../services/analysisService';
import { TriageBadge } from '../components/TriageBadge';
import { 
  FileText, 
  Image as ImageIcon, 
  Cpu, 
  MessageSquare, 
  History, 
  User, 
  ArrowRight, 
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await analysisService.getHistory();
        if (res.success) {
          setRecentAnalyses(res.analyses.slice(0, 3));
        }
      } catch (e) {
        // Ignored
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const patientName = user?.profile?.full_name || user?.username || 'Patient';

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '2rem 2.5rem', 
        color: 'white',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.8rem', 
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Patient Health Portal
            </span>
            <h1 style={{ color: 'white', fontSize: '2rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              Welcome back, {patientName}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
              Your multimodal clinical assistant is ready. Upload medical records or consult the agentic AI.
            </p>
          </div>

          <Link to="/multimodal-analysis" className="btn" style={{ background: 'white', color: '#0369a1', fontWeight: 700 }}>
            <Cpu size={18} color="#0284c7" /> Start New Analysis
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <Link to="/upload-report" className="card" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.65rem', background: '#e0f2fe', borderRadius: '10px' }}>
              <FileText size={24} color="#0284c7" />
            </div>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Upload Medical Report</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Upload lab tests, discharge summaries, or pathology documents (PDF/Scans) for OCR extraction.
          </p>
        </Link>

        <Link to="/upload-image" className="card" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.65rem', background: '#ccfbf1', borderRadius: '10px' }}>
              <ImageIcon size={24} color="#0d9488" />
            </div>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Upload Medical Image</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Upload chest X-rays, skin lesion photographs, or diagnostic scans for AI computer vision inspection.
          </p>
        </Link>

        <Link to="/multimodal-analysis" className="card" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.65rem', background: '#ede9fe', borderRadius: '10px' }}>
              <Cpu size={24} color="#7c3aed" />
            </div>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Multimodal Analysis</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Trigger the 5-agent pipeline to cross-examine report text and medical imagery simultaneously.
          </p>
        </Link>

        <Link to="/chatbot" className="card" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.65rem', background: '#fdf4ff', borderRadius: '10px' }}>
              <MessageSquare size={24} color="#c026d3" />
            </div>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Ask AI Assistant</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Ask questions about complex medical terms, lab reference ranges, or your uploaded files.
          </p>
        </Link>

        <Link to="/history" className="card" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.65rem', background: '#fff7ed', borderRadius: '10px' }}>
              <History size={24} color="#ea580c" />
            </div>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Patient History</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Review past multi-agent dossiers, clinical recommendations, and doctor verification notes.
          </p>
        </Link>

        <Link to="/profile" className="card" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.65rem', background: '#f1f5f9', borderRadius: '10px' }}>
              <User size={24} color="#475569" />
            </div>
            <ArrowRight size={18} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Medical Profile</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Manage your personal clinical profile, emergency contacts, and notification preferences.
          </p>
        </Link>
      </div>

      {/* Recent Analyses Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <h3>Recent Clinical Analyses</h3>
            <p style={{ fontSize: '0.85rem' }}>Your most recent AI multi-agent evaluations</p>
          </div>
          <Link to="/history" className="btn btn-outline btn-sm">View All History</Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading history...</div>
        ) : recentAnalyses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentAnalyses.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      Analysis #{item.id} ({item.analysis_type.toUpperCase()})
                    </span>
                    <TriageBadge level={item.triage_level} color={item.triage_color} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} /> {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.doctor_review ? (
                    <span className="badge badge-emerald">Doctor Reviewed</span>
                  ) : (
                    <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Pending Doctor Review</span>
                  )}
                  <Link to={`/analysis/${item.id}`} className="btn btn-primary btn-sm">
                    View Dossier <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <Cpu size={32} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <p>You haven't conducted any multimodal analyses yet.</p>
            <Link to="/multimodal-analysis" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
              Run First Analysis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

