import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysisService } from '../services/analysisService';
import { TriageBadge } from '../components/TriageBadge';
import { AgentWorkflowVisualizer } from '../components/AgentWorkflowVisualizer';
import { 
  FileText, 
  Image as ImageIcon, 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle, 
  MessageSquare, 
  Stethoscope, 
  Clock, 
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react';

export const AnalysisResultPage = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, findings, terms, workflow, raw

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await analysisService.getAnalysis(id);
        if (res.success) {
          setAnalysis(res.analysis);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load analysis result.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Cpu size={40} color="var(--primary)" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <h2>Compiling Multimodal Clinical Dossier...</h2>
        <p>Loading agent pipeline execution data and verified observations.</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="main-content">
        <div className="card" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Dossier Unavailable</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error || 'The requested analysis record could not be found.'}</p>
          <Link to="/dashboard" className="btn btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Extract structured agent outputs
  const agentResults = analysis.agent_results || [];
  const reportStep = agentResults.find(r => r.agent_name === 'ReportAnalysisAgent')?.output_data || {};
  const imageStep = agentResults.find(r => r.agent_name === 'ImageAnalysisAgent')?.output_data || {};
  const medInfoStep = agentResults.find(r => r.agent_name === 'MedicalInfoAgent')?.output_data || {};
  const triageStep = agentResults.find(r => r.agent_name === 'RiskTriageAgent')?.output_data || {};

  return (
    <div className="main-content">
      {/* Top Banner & Triage Header */}
      <div className="card" style={{ marginBottom: '2rem', borderLeft: `6px solid ${analysis.triage_color === 'rose' ? '#ef4444' : analysis.triage_color === 'orange' ? '#f97316' : analysis.triage_color === 'amber' ? '#f59e0b' : '#10b981'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>Clinical Analysis #{analysis.id}</span>
              <TriageBadge level={analysis.triage_level} color={analysis.triage_color} />
              <span className="badge badge-blue">{analysis.analysis_type.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Executed on {new Date(analysis.created_at).toLocaleString()} • AI Engine: {analysis.ai_provider}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/chatbot" state={{ analysisId: analysis.id }} className="btn btn-primary btn-sm">
              <MessageSquare size={16} /> Ask Chatbot About This
            </Link>
          </div>
        </div>

        {/* Doctor Review Badge if available */}
        {analysis.doctor_review && (
          <div style={{ 
            marginTop: '1.25rem', 
            padding: '1rem', 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Stethoscope size={18} /> Clinically Reviewed by Healthcare Professional
            </div>
            <p style={{ fontSize: '0.875rem', color: '#14532d', marginBottom: '0.5rem' }}>
              "{analysis.doctor_review.clinical_notes}"
            </p>
            <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
              Reviewed by {analysis.doctor_review.doctor?.full_name || 'Attending Physician'} ({analysis.doctor_review.doctor?.specialization || 'Medical Staff'}) on {new Date(analysis.doctor_review.reviewed_at).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          Executive Summary & Triage
        </button>
        <button 
          onClick={() => setActiveTab('findings')} 
          className={`btn ${activeTab === 'findings' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          Biomarkers & Visual Findings
        </button>
        <button 
          onClick={() => setActiveTab('terms')} 
          className={`btn ${activeTab === 'terms' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          Medical Explanations & Doctor Questions
        </button>
        <button 
          onClick={() => setActiveTab('workflow')} 
          className={`btn ${activeTab === 'workflow' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          Agent Execution Pipeline
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Executive Summary Card */}
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem' }}>Coordinator Agent Executive Summary</h3>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
              {analysis.overall_summary}
            </p>
          </div>

          {/* Triage & Clinical Urgency Breakdown */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={22} color="var(--primary)" /> Decision-Support Urgency Assessment
            </h3>

            <div style={{ 
              padding: '1rem 1.25rem', 
              background: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-md)',
              borderLeft: `4px solid ${analysis.triage_color === 'rose' ? '#ef4444' : analysis.triage_color === 'orange' ? '#f97316' : '#10b981'}`,
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                {analysis.triage_level}
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {triageStep.urgency_rationale || 'Findings evaluated against standardized clinical intervals.'}
              </p>
              {triageStep.action_recommended && (
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                  Recommended Action: {triageStep.action_recommended}
                </div>
              )}
            </div>

            {triageStep.emergency_disclaimer && (
              <div style={{ fontSize: '0.775rem', color: '#b45309', background: '#fffbeb', padding: '0.65rem 0.9rem', borderRadius: '6px' }}>
                {triageStep.emergency_disclaimer}
              </div>
            )}
          </div>

          {/* Modality Previews (Side-by-side if multimodal) */}
          <div className="grid-2">
            {analysis.image_file && (
              <div className="card">
                <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ImageIcon size={18} color="var(--accent)" /> Submitted Medical Image
                </h4>
                <div style={{ background: '#0f172a', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                  <img 
                    src={`/api/files/${analysis.image_file.id}`} 
                    alt="Medical Scan" 
                    style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  File: {analysis.image_file.original_name} ({Math.round(analysis.image_file.file_size / 1024)} KB)
                </div>
              </div>
            )}

            {analysis.report_file && analysis.report_file.report_data && (
              <div className="card">
                <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={18} color="var(--primary)" /> Extracted Report Document
                </h4>
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  maxHeight: '220px', 
                  overflowY: 'auto',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  border: '1px solid var(--border-color)'
                }}>
                  {analysis.report_file.report_data.extracted_text}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  File: {analysis.report_file.original_name} • OCR Engine: {analysis.report_file.report_data.ocr_engine}
                </div>
              </div>
            )}
          </div>

          {/* Uncertainty & Limitations */}
          <div className="card" style={{ background: '#f8fafc' }}>
            <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
              <Info size={18} /> Model Confidence & Limitations
            </h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <strong>Heuristic Confidence Score:</strong> {Math.round(analysis.confidence_score * 100)}%
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {analysis.limitation_notes}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: BIOMARKERS & FINDINGS */}
      {activeTab === 'findings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Abnormal Values Table */}
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem', color: '#b45309' }}>
              Flagged Out-of-Range Biomarkers ({reportStep.abnormal_values?.length || 0})
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Values that fall outside standard clinical reference intervals and warrant physician review.
            </p>

            {reportStep.abnormal_values && reportStep.abnormal_values.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Biomarker</th>
                      <th>Observed Value</th>
                      <th>Reference Interval</th>
                      <th>Status</th>
                      <th>Clinical Significance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportStep.abnormal_values.map((ab, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{ab.parameter}</td>
                        <td style={{ fontWeight: 700 }}>{ab.value}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{ab.reference_range}</td>
                        <td>
                          <span className={`badge ${ab.status === 'High' ? 'badge-rose' : 'badge-amber'}`}>
                            {ab.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.825rem' }}>{ab.clinical_significance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#166534', background: '#f0fdf4', borderRadius: '8px' }}>
                <CheckCircle2 size={24} style={{ margin: '0 auto 0.4rem', display: 'block' }} />
                No biomarkers were flagged outside of standard reference intervals.
              </div>
            )}
          </div>

          {/* All Extracted Biomarkers Table */}
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem' }}>All Parsed Biomarker Parameters</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Parameter</th>
                    <th>Measured Value</th>
                    <th>Reference Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportStep.findings || []).map((f, i) => (
                    <tr key={i}>
                      <td><span className="badge" style={{ background: '#f1f5f9' }}>{f.category || 'General'}</span></td>
                      <td style={{ fontWeight: 600 }}>{f.parameter}</td>
                      <td>{f.value}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{f.reference_range}</td>
                      <td>
                        <span className={`badge ${f.status === 'Normal' ? 'badge-emerald' : 'badge-amber'}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Image Visual Observations */}
          {imageStep.visual_observations && imageStep.visual_observations.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>Image Analysis Agent Visual Features</h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                Inferred Modality: <strong>{imageStep.inferred_modality}</strong>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {imageStep.visual_observations.map((obs, idx) => (
                  <div key={idx} style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>
                      {obs.feature}
                    </div>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {obs.assessment}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Clarity: {obs.clarity} • Confidence: {Math.round((obs.confidence || 0.85) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEDICAL EXPLANATIONS & QUESTIONS */}
      {activeTab === 'terms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Plain English Terminology Glossary */}
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem' }}>Medical Terminology in Simple Language</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Complex medical jargon from this report translated into patient-friendly explanations by the Medical Information Agent.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {(medInfoStep.terminology_explanations || []).map((term, i) => (
                <div key={i} style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '0.35rem' }}>
                    {term.term}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {term.layperson_explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Questions to Ask Your Doctor */}
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={20} color="var(--accent)" /> Questions to Discuss With Your Doctor
            </h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              Bring these prepared questions to your next appointment to make the most of your consultation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(medInfoStep.questions_for_doctor || []).map((q, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 1rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>{idx + 1}.</span>
                  <span style={{ fontSize: '0.9rem', color: '#065f46', fontWeight: 500 }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AGENT WORKFLOW */}
      {activeTab === 'workflow' && (
        <div>
          <AgentWorkflowVisualizer steps={agentResults} isLive={false} />
        </div>
      )}
    </div>
  );
};

