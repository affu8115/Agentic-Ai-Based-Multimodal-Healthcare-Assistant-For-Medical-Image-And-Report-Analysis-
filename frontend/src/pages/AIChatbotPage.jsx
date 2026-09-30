import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { analysisService } from '../services/analysisService';
import { MessageSquare, Send, Bot, User, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

export const AIChatbotPage = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(location.state?.analysisId || '');
  const [availableAnalyses, setAvailableAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await analysisService.getHistory();
        if (res.success) {
          setAvailableAnalyses(res.analyses);
        }
      } catch (e) {
        // Ignored
      }
    };
    fetchAnalyses();
  }, []);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        message: (
          "Hello! I am your AI Healthcare Information Assistant. "
          + "You can ask me questions about medical terms, standard reference ranges, or your uploaded lab reports and scans.\n\n"
          + "⚠️ Safety Notice: I cannot provide a definitive medical diagnosis or prescribe medications. Please consult your physician for personalized medical care."
        )
      }
    ]);
  }, [selectedAnalysisId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to UI immediately
    const userMsgObj = { id: Date.now(), role: 'user', message: userText };
    setMessages((prev) => [...prev, userMsgObj]);
    setLoading(true);

    try {
      const res = await chatService.sendMessage(userText, selectedAnalysisId ? parseInt(selectedAnalysisId) : null);
      if (res.success && res.assistant_message) {
        setMessages((prev) => [...prev, res.assistant_message]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          message: 'I encountered an error connecting to the medical assistant service. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedPrompt = (promptText) => {
    setInputMessage(promptText);
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>AI Healthcare Chatbot</h1>
            <p>Ask questions and receive plain-language explanations grounded in your medical documentation.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Medical Context:</span>
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedAnalysisId}
              onChange={(e) => setSelectedAnalysisId(e.target.value)}
            >
              <option value="">-- General Health Inquiries --</option>
              {availableAnalyses.map((a) => (
                <option key={a.id} value={a.id}>
                  Analysis #{a.id} ({a.analysis_type.toUpperCase()} - {new Date(a.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div 
                key={m.id || idx} 
                className={`chat-bubble ${m.role}`}
                style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
              >
                <div style={{ 
                  flexShrink: 0, 
                  marginTop: '2px', 
                  padding: '4px', 
                  background: m.role === 'assistant' ? '#e0f2fe' : 'rgba(255,255,255,0.2)', 
                  borderRadius: '6px' 
                }}>
                  {m.role === 'assistant' ? <Bot size={18} color="#0284c7" /> : <User size={18} color="white" />}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {m.message}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={18} color="#0284c7" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Consulting medical knowledge base and cross-referencing context...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Prompts */}
          <div style={{ 
            padding: '0.5rem 1rem', 
            background: '#f8fafc', 
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={12} /> Suggestions:
            </span>
            <button 
              type="button" 
              onClick={() => handleSuggestedPrompt("Can you explain this report in simple language?")}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              Explain report in simple language
            </button>
            <button 
              type="button" 
              onClick={() => handleSuggestedPrompt("What do my abnormal values mean?")}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              What do abnormal values mean?
            </button>
            <button 
              type="button" 
              onClick={() => handleSuggestedPrompt("What questions should I ask my doctor?")}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              Questions for my doctor
            </button>
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask a question about your report, medical terms, or test ranges..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !inputMessage.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

