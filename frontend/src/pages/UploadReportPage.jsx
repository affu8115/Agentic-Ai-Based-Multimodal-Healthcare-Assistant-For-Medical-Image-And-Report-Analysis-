import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadService } from '../services/uploadService';
import { FileText, Upload, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Cpu } from 'lucide-react';

export const UploadReportPage = () => {
  const [file, setFile] = useState(null);
  const [customText, setCustomText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [ocrEngine, setOcrEngine] = useState('');
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUploadAndOcr = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await uploadService.uploadReport(file, customText);
      if (res.success) {
        setUploadedFileId(res.file.id);
        setExtractedText(res.extracted_text || '');
        setOcrEngine(res.ocr_engine || 'OCR Engine');
        setSuccessMsg('Report successfully uploaded and text extracted!');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload and extract text.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToAnalysis = () => {
    if (uploadedFileId) {
      navigate('/multimodal-analysis', { 
        state: { 
          selectedReportId: uploadedFileId, 
          extractedText: extractedText 
        } 
      });
    }
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1>Upload Medical Report</h1>
          <p>Extract laboratory parameters, diagnostic findings, and clinical notes from PDFs and scanned documents via OCR.</p>
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

        <div className="grid-2">
          {/* Upload Card */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={20} color="var(--primary)" /> Select Document
            </h3>

            <form onSubmit={handleUploadAndOcr}>
              <div style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                padding: '2rem 1.5rem', 
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer',
                marginBottom: '1.25rem'
              }}>
                <FileText size={40} color="var(--primary)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {file ? file.name : 'Click to browse or drop file here'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supports PDF, PNG, JPG, JPEG, TXT (Max 16MB)
                </p>
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileChange}
                  style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                  id="report-file-input"
                />
                <label htmlFor="report-file-input" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem', cursor: 'pointer' }}>
                  Browse Files
                </label>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.825rem' }}>
                  Manual Text Input / Additional Symptoms (Optional)
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Paste report text directly or add patient notes here if you prefer..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  style={{ minHeight: '100px' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }} 
                disabled={loading || (!file && !customText)}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Running OCR Extraction...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Upload & Extract Text
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Extracted Text Preview Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1.05rem' }}>Extracted Clinical Text</h3>
                {ocrEngine && (
                  <span className="badge badge-blue" style={{ marginTop: '0.25rem' }}>
                    Engine: {ocrEngine}
                  </span>
                )}
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <textarea
                className="form-textarea"
                style={{ 
                  flex: 1, 
                  fontFamily: 'monospace', 
                  fontSize: '0.85rem', 
                  minHeight: '260px',
                  background: '#f8fafc',
                  marginBottom: '1rem'
                }}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Extracted text from your uploaded document or OCR engine will appear here. You can edit this text directly before triggering the AI analysis."
              />

              {uploadedFileId && (
                <button 
                  onClick={handleProceedToAnalysis} 
                  className="btn btn-accent" 
                  style={{ width: '100%' }}
                >
                  <Cpu size={16} /> Proceed to Multimodal Analysis <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

