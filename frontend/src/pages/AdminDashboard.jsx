import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { 
  Shield, 
  Users, 
  FileText, 
  Image as ImageIcon, 
  Cpu, 
  Activity, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Server
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, audit, health
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchAdminData = async () => {
    try {
      const [sRes, uRes, lRes, hRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getAuditLogs(50),
        adminService.getSystemHealth()
      ]);
      if (sRes.success) setStats(sRes.statistics);
      if (uRes.success) setUsers(uRes.users);
      if (lRes.success) setAuditLogs(lRes.logs);
      if (hRes.success) setSystemHealth(hRes.health);
    } catch (e) {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId, currentActive) => {
    try {
      const res = await adminService.toggleUserStatus(userId, !currentActive);
      if (res.success) {
        setActionMsg(res.message);
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u));
        setTimeout(() => setActionMsg(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Shield size={40} color="var(--primary)" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <h2>Loading Administrator Control Center...</h2>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Admin Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '2rem 2.5rem', 
        color: 'white',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Shield size={22} color="#38bdf8" />
              <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                System Administration
              </span>
            </div>
            <h1 style={{ color: 'white', fontSize: '1.85rem', marginBottom: '0.25rem' }}>
              Platform Governance & Analytics
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Monitor system health, manage platform users, and review non-sensitive audit telemetry.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.75rem 1.25rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>AI API Mode</div>
            <div style={{ fontWeight: 700, color: systemHealth?.ai_service?.is_configured ? '#86efac' : '#fde047', fontSize: '0.95rem' }}>
              {systemHealth?.ai_service?.is_configured ? 'Live External API' : 'Clinical Heuristics'}
            </div>
          </div>
        </div>
      </div>

      {actionMsg && (
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
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          Analytics & Metrics
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          User Management ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('health')} 
          className={`btn ${activeTab === 'health' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          Subsystem Diagnostics
        </button>
        <button 
          onClick={() => setActiveTab('audit')} 
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          Audit Telemetry ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Numbers */}
          <div className="grid-4">
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Registered Users</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>{stats.users?.total}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                {stats.users?.patients} Patients • {stats.users?.doctors} Doctors
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uploaded Diagnostic Files</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>{stats.files?.total_files}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.25rem' }}>
                {stats.files?.reports} Reports • {stats.files?.images} Images
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multi-Agent Analyses</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>{stats.analyses?.total}</div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
                {stats.analyses?.review_rate_percent}% Clinically Reviewed
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doctor Reviews Submitted</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>{stats.analyses?.reviewed_by_doctor}</div>
              <div style={{ fontSize: '0.75rem', color: '#ea580c', marginTop: '0.25rem' }}>
                Clinical Verification
              </div>
            </div>
          </div>

          {/* Triage Urgency Distribution */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Triage Urgency Distribution</h3>
            <div className="grid-4">
              <div style={{ padding: '1rem', background: 'var(--tier-1-bg)', borderRadius: '8px', border: '1px solid var(--tier-1-border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--tier-1-text)' }}>Tier 1: General Info</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--tier-1-text)' }}>
                  {stats.analyses?.triage_distribution?.['Tier 1: General Information'] || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--tier-1-text)' }}>Routine / Normal baseline</div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--tier-2-bg)', borderRadius: '8px', border: '1px solid var(--tier-2-border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--tier-2-text)' }}>Tier 2: Discuss with Doctor</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--tier-2-text)' }}>
                  {stats.analyses?.triage_distribution?.['Tier 2: Discuss with Doctor'] || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--tier-2-text)' }}>Mild out-of-range deviations</div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--tier-3-bg)', borderRadius: '8px', border: '1px solid var(--tier-3-border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--tier-3-text)' }}>Tier 3: Prompt Attention</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--tier-3-text)' }}>
                  {stats.analyses?.triage_distribution?.['Tier 3: Prompt Medical Attention'] || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--tier-3-text)' }}>Significant abnormalities</div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--tier-4-bg)', borderRadius: '8px', border: '1px solid var(--tier-4-border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--tier-4-text)' }}>Tier 4: Emergency Warning</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--tier-4-text)' }}>
                  {stats.analyses?.triage_distribution?.['Tier 4: Emergency Warning'] || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--tier-4-text)' }}>Acute critical indicators</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3>Registered Users & Access Control</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered At</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-rose' : u.role === 'doctor' ? 'badge-blue' : 'badge-emerald'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {u.is_active ? (
                        <span className="badge badge-emerald">Active</span>
                      ) : (
                        <span className="badge badge-rose">Deactivated</span>
                      )}
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleToggleUser(u.id, u.is_active)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH & DIAGNOSTICS */}
      {activeTab === 'health' && systemHealth && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={20} color="var(--primary)" /> AI Service Subsystem
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div><strong>Active Provider:</strong> {systemHealth.ai_service?.provider}</div>
              <div><strong>Configured Model:</strong> {systemHealth.ai_service?.model}</div>
              <div><strong>Status Message:</strong> {systemHealth.ai_service?.status_message}</div>
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem' }}>
                💡 To enable live Google Gemini multimodal reasoning, set <code>GEMINI_API_KEY</code> in the <code>.env</code> file.
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardDrive size={20} color="var(--accent)" /> OCR & Storage Subsystems
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div><strong>Database:</strong> {systemHealth.database}</div>
              <div><strong>Tesseract Python Lib:</strong> {systemHealth.ocr_engine?.tesseract_library_present ? 'Installed' : 'Missing'}</div>
              <div><strong>Native PDF Parser:</strong> {systemHealth.ocr_engine?.pypdf_library_present ? 'Active' : 'Missing'}</div>
              <div><strong>Upload Storage Used:</strong> {systemHealth.storage?.used_megabytes} MB (Limit: {systemHealth.storage?.max_file_size_mb} MB per file)</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <h3>System Audit Trail</h3>
            <p style={{ fontSize: '0.85rem' }}>Logged administrative, upload, and authentication actions</p>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User ID</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#f1f5f9', color: '#0f172a' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.username || `User #${log.user_id}`}</td>
                    <td style={{ fontSize: '0.8rem' }}>{log.ip_address || '127.0.0.1'}</td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

