import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Cpu, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck, 
  Stethoscope, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, isPatient, isDoctor, isAdmin } = useAuth();

  const getDashboardPath = () => {
    if (isDoctor) return '/doctor-dashboard';
    if (isAdmin) return '/admin-dashboard';
    return '/dashboard';
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        padding: '4rem 1rem 3rem', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, #e0f2fe 0%, #f8fafc 100%)',
        borderRadius: '0 0 32px 32px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '3rem'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'white', 
            padding: '0.4rem 1rem', 
            borderRadius: '9999px',
            boxShadow: 'var(--shadow-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--primary-dark)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <Cpu size={16} color="var(--primary)" />
            B.Tech Final-Year Capstone Project • Multi-Agent Multimodal AI
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', letterSpacing: '-0.025em' }}>
            Agentic AI-Based Multimodal Healthcare Assistant
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Empowering patients and clinicians by orchestrating 5 specialized AI agents to analyze, cross-reference, 
            and explain complex medical images and clinical reports in accessible plain language.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to={getDashboardPath()} className="btn btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
                Open Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
                  Sign In to Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Safety Notice Card */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={24} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ color: '#92400e', marginBottom: '0.25rem' }}>Educational & Clinical Decision Support Notice</h4>
              <p style={{ color: '#b45309', fontSize: '0.875rem' }}>
                This platform is strictly designed as an academic prototype and clinical decision-support assistant. 
                It does <strong>NOT</strong> present AI findings as confirmed diagnoses, replace qualified physicians, 
                or prescribe pharmaceuticals. In cases of acute or worsening symptoms, please seek immediate medical evaluation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Specialized Agents Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 4rem', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>The 5-Agent Collaborative Architecture</h2>
          <p style={{ maxWidth: '650px', margin: '0 auto' }}>
            Rather than relying on a single monolithic prompt, our system divides medical interpretation into dedicated, 
            verifiable agent roles.
          </p>
        </div>

        <div className="grid-3">
          <div className="card">
            <div style={{ padding: '0.5rem', width: 'fit-content', background: '#e0f2fe', borderRadius: '8px', marginBottom: '1rem' }}>
              <Cpu size={24} color="#0284c7" />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>1. Coordinator Agent</h3>
            <p style={{ fontSize: '0.875rem' }}>
              The master orchestrator. Validates input modalities, schedules analysis tasks, resolves conflicting signals, and synthesizes the unified final dossier.
            </p>
          </div>

          <div className="card">
            <div style={{ padding: '0.5rem', width: 'fit-content', background: '#ccfbf1', borderRadius: '8px', marginBottom: '1rem' }}>
              <FileText size={24} color="#0d9488" />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>2. Report Analysis Agent</h3>
            <p style={{ fontSize: '0.875rem' }}>
              Extracts clinical parameters from OCR text, identifies abnormal biomarker levels against standardized clinical ranges, and flags diagnostic impressions.
            </p>
          </div>

          <div className="card">
            <div style={{ padding: '0.5rem', width: 'fit-content', background: '#ede9fe', borderRadius: '8px', marginBottom: '1rem' }}>
              <ImageIcon size={24} color="#7c3aed" />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>3. Image Analysis Agent</h3>
            <p style={{ fontSize: '0.875rem' }}>
              Inspects radiological and clinical images (such as X-rays), evaluating contrast symmetry, anatomical landmarks, and noting explicit uncertainty limits.
            </p>
          </div>

          <div className="card">
            <div style={{ padding: '0.5rem', width: 'fit-content', background: '#fdf4ff', borderRadius: '8px', marginBottom: '1rem' }}>
              <Activity size={24} color="#c026d3" />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>4. Medical Info Agent</h3>
            <p style={{ fontSize: '0.875rem' }}>
              Translates intimidating clinical jargon into clear, compassionate layperson language and formulates actionable questions for doctor appointments.
            </p>
          </div>

          <div className="card">
            <div style={{ padding: '0.5rem', width: 'fit-content', background: '#fff7ed', borderRadius: '8px', marginBottom: '1rem' }}>
              <ShieldCheck size={24} color="#ea580c" />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>5. Risk / Triage Agent</h3>
            <p style={{ fontSize: '0.875rem' }}>
              Evaluates synthesis against emergency red flags, categorizing urgency into 4 distinct clinical decision support tiers (Tier 1 to Tier 4).
            </p>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
            <div style={{ padding: '0.5rem', width: 'fit-content', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '1rem' }}>
              <Stethoscope size={24} color="#38bdf8" />
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: 'white' }}>Doctor Verification</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Doctors can access an authorized review dashboard, inspect raw scans and OCR text, add clinical verification notes, and sign off on analyses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

