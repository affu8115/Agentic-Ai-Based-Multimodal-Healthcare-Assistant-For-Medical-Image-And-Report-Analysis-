import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Settings, Cpu, HardDrive, Key, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const SettingsPage = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await adminService.getSystemHealth();
        if (res.success) {
          setHealth(res.health);
        }
      } catch (e) {
        // Ignored
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="main-content">
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1>System Configuration & Environment</h1>
          <p>Inspect active runtime settings, AI service providers, and environment variable integrations.</p>
        </div>

        {/* AI Service Configuration Status */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={20} color="var(--primary)" /> Multimodal AI Model Configuration
            </h3>
            {health?.ai_service?.is_configured ? (
              <span className="badge badge-emerald">Live API Key Active</span>
            ) : (
              <span className="badge badge-amber">Using Rule-Based Fallback</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <strong>Active Provider:</strong> {health?.ai_service?.provider || 'Clinical Expert Engine'}
            </div>
            <div>
              <strong>Status:</strong> {health?.ai_service?.status_message || 'Operating normally'}
            </div>

            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem 1.25rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={16} /> How to configure a Live Google Gemini API Key:
              </h4>
              <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Obtain a free API key from <strong>Google AI Studio</strong> (<code>https://aistudio.google.com/</code>).</li>
                <li>In the root of the project, create a file named <code>.env</code> (or copy from <code>.env.example</code>).</li>
                <li>Add your key: <code>GEMINI_API_KEY=AIzaSy...your-actual-key</code>.</li>
                <li>Restart the Flask backend (<code>python run.py</code>).</li>
              </ol>
            </div>
          </div>
        </div>

        {/* OCR Engine Configuration Status */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={20} color="var(--accent)" /> OCR & Document Extraction Subsystem
            </h3>
            <span className="badge badge-emerald">Operational</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <strong>Native PDF Text Extractor:</strong> {health?.ocr_engine?.pypdf_library_present ? 'Available (PyPDF)' : 'Not Installed'}
            </div>
            <div>
              <strong>Tesseract Python Wrapper:</strong> {health?.ocr_engine?.tesseract_library_present ? 'Available (pytesseract)' : 'Not Installed'}
            </div>

            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem 1.25rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-dark)' }}>
                Tesseract OCR Binary for Windows:
              </h4>
              <p style={{ marginBottom: '0.5rem' }}>
                If you wish to perform OCR on scanned image reports (such as photographic prints of blood work), 
                install Tesseract OCR binary for Windows from:
              </p>
              <code style={{ background: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                https://github.com/UB-Mannheim/tesseract/wiki
              </code>
              <p style={{ marginTop: '0.5rem' }}>
                If installed in a non-standard path, add <code>TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe</code> in your <code>.env</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Database & Storage */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardDrive size={20} color="var(--primary)" /> Database & Storage Settings
            </h3>
          </div>
          <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div><strong>Database Engine:</strong> SQLite 3 via SQLAlchemy ORM (File: <code>backend/healthcare.db</code>)</div>
            <div><strong>Uploads Location:</strong> <code>{health?.storage?.upload_folder}</code></div>
            <div><strong>Current Uploads Storage:</strong> {health?.storage?.used_megabytes} MB</div>
          </div>
        </div>
      </div>
    </div>
  );
};

