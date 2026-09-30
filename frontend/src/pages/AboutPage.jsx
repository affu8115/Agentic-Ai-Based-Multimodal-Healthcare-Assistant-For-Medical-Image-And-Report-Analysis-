import React from 'react';
import { Activity, ShieldCheck, Cpu, Code, Database, FileText, CheckCircle2 } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="main-content">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>
            Academic Project Overview
          </span>
          <h1 style={{ marginBottom: '0.75rem' }}>About The Project</h1>
          <p style={{ fontSize: '1.1rem' }}>
            “Agentic AI-Based Multimodal Healthcare Assistant for Medical Image and Report Analysis”
          </p>
        </div>

        {/* Project Objectives */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} color="var(--primary)" /> Project Purpose & Objectives
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Modern healthcare generates vast amounts of diagnostic data across diverse modalities, including radiology scans 
            and laboratory report documents. Patients often struggle to interpret specialized clinical terms, while clinicians 
            face increasing administrative overhead in synthesizing disparate data sources.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            This B.Tech final-year capstone project addresses these challenges by developing a collaborative, multi-agent AI system 
            that combines medical images (e.g., chest X-rays) and medical report text (via OCR). Multiple specialized AI agents work in concert 
            to process, analyze, summarize, and translate clinical findings into accessible language, backed by a clinical decision-support triage framework.
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Decision Support Tool:</strong> Designed to augment clinical understanding rather than replace certified medical practitioners.</li>
            <li><strong>Zero Diagnostic Certainty Claims:</strong> Expresses findings with explicit uncertainty ranges and anatomical limitations.</li>
            <li><strong>Multi-Agent Division of Labor:</strong> Isolates report parsing, computer vision image analysis, terminology translation, and triage into separate inspectable agents.</li>
          </ul>
        </div>

        {/* Technology Stack */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={24} color="var(--accent)" /> Technology Stack
          </h2>
          <div className="grid-2">
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Frontend Architecture</h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li><strong>React 18:</strong> Modern component-driven user interface</li>
                <li><strong>Vite:</strong> Next-generation build tooling & HMR</li>
                <li><strong>React Router v6:</strong> Client-side role-based routing across 17 pages</li>
                <li><strong>Lucide Icons:</strong> Consistent medical & technical iconography</li>
                <li><strong>Responsive CSS:</strong> Custom professional healthcare design system</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Backend Architecture</h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li><strong>Python Flask:</strong> RESTful API microservice framework</li>
                <li><strong>SQLite + SQLAlchemy ORM:</strong> Relational data persistence with 10 models</li>
                <li><strong>PyJWT & Werkzeug:</strong> Token authentication & bcrypt password hashing</li>
                <li><strong>Tesseract OCR & PyPDF:</strong> Hybrid document text extraction</li>
                <li><strong>Gemini 1.5 Flash + Fallback:</strong> Multimodal AI integration with local clinical expert rule engine</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ethical AI & Safety Safeguards */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} color="#10b981" /> Ethical AI & Clinical Safety Principles
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Transparency & Verification:</strong> Every agent step records its timing, status, and raw JSON payload so both patients and doctors can inspect how conclusions were reached.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Physician Sign-Off:</strong> Includes a dedicated Doctor Dashboard where certified healthcare professionals can review AI dossiers and write authoritative clinical notes.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Truthful Fallbacks:</strong> The application clearly reports when an external AI API key is unconfigured and switches to verified clinical heuristic rules without generating hallucinations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

