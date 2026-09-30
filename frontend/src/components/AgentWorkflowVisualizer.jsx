import React, { useState } from 'react';
import { 
  Cpu, 
  FileSearch, 
  Scan, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AgentWorkflowVisualizer = ({ steps = [], isLive = false }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const getAgentIcon = (name) => {
    switch (name) {
      case 'CoordinatorAgent':
        return <Cpu size={20} color="#0284c7" />;
      case 'ReportAnalysisAgent':
        return <FileSearch size={20} color="#0d9488" />;
      case 'ImageAnalysisAgent':
        return <Scan size={20} color="#6366f1" />;
      case 'MedicalInfoAgent':
        return <BookOpen size={20} color="#8b5cf6" />;
      case 'RiskTriageAgent':
        return <AlertTriangle size={20} color="#f59e0b" />;
      default:
        return <CheckCircle2 size={20} color="#10b981" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-emerald"><CheckCircle2 size={12} /> Completed</span>;
      case 'processing':
        return <span className="badge badge-blue"><Clock size={12} className="animate-spin" /> Processing</span>;
      case 'unable_to_process':
      case 'failed':
        return <span className="badge badge-rose"><AlertCircle size={12} /> Failed</span>;
      case 'requires_review':
        return <span className="badge badge-amber"><AlertTriangle size={12} /> Needs Review</span>;
      case 'skipped':
        return <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Skipped</span>;
      default:
        return <span className="badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>Waiting</span>;
    }
  };

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
      <div className="card-header">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <Cpu size={22} color="var(--primary)" />
            Multi-Agent AI Workflow Pipeline
          </h3>
          <p style={{ fontSize: '0.825rem', marginTop: '0.2rem' }}>
            Dynamic collaborative orchestration between specialized clinical agents
          </p>
        </div>
        {isLive && (
          <span className="badge badge-blue">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', display: 'inline-block' }} />
            Pipeline Running
          </span>
        )}
      </div>

      <div className="workflow-pipeline">
        {steps && steps.length > 0 ? (
          steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            return (
              <div 
                key={idx} 
                className={`agent-card ${step.status || 'waiting'}`}
                style={{ flexDirection: 'column', alignItems: 'stretch' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      padding: '0.5rem', 
                      background: '#f8fafc', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center',
                      border: '1px solid var(--border-color)'
                    }}>
                      {getAgentIcon(step.agent_name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {step.agent_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {step.execution_time_ms ? `${step.execution_time_ms} ms execution` : 'Orchestrated sub-task'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {getStatusBadge(step.status)}
                    {step.output_data && (
                      <button 
                        onClick={() => toggleExpand(idx)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Inspect step payload"
                      >
                        {expandedIndex === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible raw data view */}
                {expandedIndex === idx && step.output_data && (
                  <div style={{ 
                    marginTop: '0.75rem', 
                    padding: '0.75rem', 
                    background: '#0f172a', 
                    color: '#38bdf8', 
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(step.output_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
            Pipeline will initialize upon selecting multimodal input parameters.
          </div>
        )}
      </div>
    </div>
  );
};

