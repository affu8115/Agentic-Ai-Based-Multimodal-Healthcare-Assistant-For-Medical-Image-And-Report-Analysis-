import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadService } from '../services/uploadService';
import { Image as ImageIcon, Upload, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Cpu, Shield } from 'lucide-react';

export const UploadImagePage = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a medical image to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await uploadService.uploadImage(file);
      if (res.success) {
        setUploadedFile(res.file);
        setSuccessMsg('Medical image uploaded successfully and verified for analysis!');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Image upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToAnalysis = () => {
    if (uploadedFile) {
      navigate('/multimodal-analysis', { 
        state: { 
          selectedImageId: uploadedFile.id,
          previewUrl: previewUrl 
        } 
      });
    }
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1>Upload Medical Image</h1>
          <p>Upload radiological X-rays or clinical photographs (JPG, JPEG, PNG) for computer vision pattern analysis.</p>
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
              <Upload size={20} color="var(--accent)" /> Select Medical Image
            </h3>

            <form onSubmit={handleUpload}>
              <div style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                padding: '2.5rem 1.5rem', 
                textAlign: 'center',
                background: '#f8fafc',
                marginBottom: '1.25rem'
              }}>
                <ImageIcon size={48} color="var(--accent)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {file ? file.name : 'Choose an image file'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  JPG, JPEG, or PNG format (Max 16MB)
                </p>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                  id="image-file-input"
                />
                <label htmlFor="image-file-input" className="btn btn-outline btn-sm" style={{ marginTop: '1rem', cursor: 'pointer' }}>
                  Browse Files
                </label>
              </div>

              <div style={{ 
                background: '#f1f5f9', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem'
              }}>
                <Shield size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Supported modalities: Chest radiographs, skeletal X-rays, and dermatological skin photos.
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }} 
                disabled={loading || !file}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Uploading & Validating...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Upload Image
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Image Preview Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1.05rem' }}>Visual Preview</h3>
              {uploadedFile && (
                <span className="badge badge-emerald">Ready for AI Analysis</span>
              )}
            </div>

            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#0f172a',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              minHeight: '260px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Medical scan preview" 
                  style={{ maxHeight: '280px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <ImageIcon size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem' }}>Image preview will render here</p>
                </div>
              )}
            </div>

            {uploadedFile && (
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
  );
};

