import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadService } from '../services/uploadService';
import { analysisService } from '../services/analysisService';
import { AgentWorkflowVisualizer } from '../components/AgentWorkflowVisualizer';
import { Cpu, FileText, Image as ImageIcon, Play, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const MultimodalAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [availableReports, setAvailableReports] = useState([]);
  const [availableImages, setAvailableImages] = useState([]);
  
  const [selectedReportId, setSelectedReportId] = useState(location.state?.selectedReportId || '');
  const [selectedImageId, setSelectedImageId] = useState(location.state?.selectedImageId || '');
  const [customText, setCustomText] = useState(location.state?.extractedText || '');

  const [workflowSteps, setWorkflowSteps] = useState([
    { agent_name: 'CoordinatorAgent', status: 'waiting', execution_time_ms: 0 },
    { agent_name: 'ReportAnalysisAgent', status: 'waiting', execution_time_ms: 0 },
    { agent_name: 'ImageAnalysisAgent', status: 'waiting', execution_time_ms: 0 },
    { agent_name: 'MedicalInfoAgent', status: 'waiting', execution_time_ms: 0 },
    { agent_name: 'RiskTriageAgent', status: 'waiting', execution_time_ms: 0 },
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [completedAnalysisId, setCompletedAnalysisId] = useState(null);

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const [repRes, imgRes] = await Promise.all([
          uploadService.getFiles('report'),
          uploadService.getFiles('image')
        ]);
        if (repRes.success) setAvailableReports(repRes.files);
        if (imgRes.success) setAvailableImages(imgRes.files);
      } catch (e) {
        // Ignored
      }
    };
    fetchUserFiles();
  }, []);

  const handleStartAnalysis = async () => {
    if (!selectedReportId && !selectedImageId && !customText.trim()) {
      setError('Please select at least one medical report or medical image to analyze.');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setCompletedAnalysisId(null);

    // Initial visual state
    setWorkflowSteps([
      { agent_name: 'CoordinatorAgent', status: 'processing', execution_time_ms: 0 },
      { agent_name: 'ReportAnalysisAgent', status: selectedReportId || customText ? 'waiting' : 'skipped', execution_time_ms: 0 },
      { agent_name: 'ImageAnalysisAgent', status: selectedImageId ? 'waiting' : 'skipped', execution_time_ms: 0 },
      { agent_name: 'MedicalInfoAgent', status: 'waiting', execution_time_ms: 0 },
      { agent_name: 'RiskTriageAgent', status: 'waiting', execution_time_ms: 0 },
    ]);

    try {
      const payload = {
        report_file_id: selectedReportId ? parseInt(selectedReportId) : null,
        image_file_id: selectedImageId ? parseInt(selectedImageId) : null,
        custom_text: customText.trim()
      };

      const res = await analysisService.startAnalysis(payload);

      if (res.success && res.analysis) {
        setCompletedAnalysisId(res.analysis.id);

        // Update workflow visualizer with real execution traces
        if (res.analysis.agent_results && res.analysis.agent_results.length > 0) {
          setWorkflowSteps(res.analysis.agent_results);
        } else if (res.synthesized_output?.agent_workflow_steps) {
          setWorkflowSteps(res.synthesized_output.agent_workflow_steps);
        }

        // Navigate automatically after a brief moment
        setTimeout(() => {
          navigate(`/analysis/${res.analysis.id}`);
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Analysis workflow failed.');
      setWorkflowSteps((prev) => prev.map(s => s.status === 'processing' ? { ...s, status: 'unable_to_process' } : s));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1>Multimodal AI Analysis</h1>
          <p>
            Configure and run the multi-agent clinical decision-support pipeline across report text and medical imaging.
          </p>
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

        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          {/* Modality 1: Report Selection */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                <FileText size={18} color="var(--primary)" /> Modality 1: Medical Report
              </h3>
            </div>

            <div className="form-group">
              <label className="form-label">Select Uploaded Report File</label>
              <select 
                className="form-select"
                value={selectedReportId} 
                onChange={(e) => setSelectedReportId(e.target.value)}
              >
                <option value="">-- None (Or type custom text below) --</option>
                {availableReports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.original_name} ({new Date(r.uploaded_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>
                Report Clinical Text / OCR Content
              </label>
              <textarea
                className="form-textarea"
                style={{ fontSize: '0.85rem', minHeight: '130px' }}
                placeholder="Paste lab report parameters (e.g. Hemoglobin: 13.5 g/dL, WBC: 12000, Fasting Glucose: 110 mg/dL)..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            </div>
          </div>

          {/* Modality 2: Medical Image Selection */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                <ImageIcon size={18} color="var(--accent)" /> Modality 2: Medical Image
              </h3>
            </div>

            <div className="form-group">
              <label className="form-label">Select Uploaded Diagnostic Image</label>
              <select 
                className="form-select"
                value={selectedImageId} 
                onChange={(e) => setSelectedImageId(e.target.value)}
              >
                <option value="">-- None (Report Only Analysis) --</option>
                {availableImages.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.original_name} ({new Date(img.uploaded_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {selectedImageId ? (
              <div style={{ 
                background: '#0f172a', 
                borderRadius: '8px', 
                height: '165px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img 
                  src={`/api/files/${selectedImageId}`} 
                  alt="Selected medical scan" 
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ) : (
              <div style={{ 
                background: '#f8fafc', 
                border: '1px dashed var(--border-color)', 
                borderRadius: '8px', 
                height: '165px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <ImageIcon size={32} style={{ opacity: 0.5, marginBottom: '0.4rem' }} />
                <span style={{ fontSize: '0.8rem' }}>No medical image chosen</span>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Agent Visualizer Component */}
        <AgentWorkflowVisualizer steps={workflowSteps} isLive={isAnalyzing} />

        {/* Action Button */}
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <button 
            onClick={handleStartAnalysis}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', boxShadow: 'var(--shadow-md)' }}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Cpu size={20} className="animate-spin" /> Orchestrating 5-Agent Pipeline...
              </>
            ) : (
              <>
                <Play size={20} /> Run Multi-Agent Analysis
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

