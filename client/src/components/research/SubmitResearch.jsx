// client/src/components/research/SubmitResearch.jsx
import { useState } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import Toast from '../common/Toast';
import InfoIcon from '../common/InfoIcon';
import Tooltip from '../common/Tooltip';
import DraftManager from '../common/DraftManager';

const SubmitResearch = ({ onClose, onSuccess }) => {
  const { user } = useAuth();

  /* =======================
     STATE
  ======================= */
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [touched, setTouched] = useState({
    title: false,
    subjectArea: false,
    abstract: false
  });

  const [formData, setFormData] = useState({
    title: '',
    authors: [user?.firstName + ' ' + user?.lastName || ''],
    coAuthors: [],
    abstract: '',
    keywords: [],
    category: 'Completed',
    subjectArea: '',
    yearCompleted: new Date().getFullYear()
  });

  const [currentKeyword, setCurrentKeyword] = useState('');
  const [currentCoAuthor, setCurrentCoAuthor] = useState('');

  /* =======================
     CONSTANTS
  ======================= */
  const subjectAreas = [
    'Pediatric Nursing',
    'Adult Health Nursing',
    'Maternal and Child Nursing',
    'Community Health Nursing',
    'Mental Health Nursing',
    'Nursing Informatics',
    'Geriatric Nursing',
    'Critical Care Nursing',
    'Oncology Nursing',
    'Surgical Nursing',
    'Emergency Nursing',
    'Public Health Nursing',
    'Other'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const progress = (step / 3) * 100;

  /* =======================
     HELPERS
  ======================= */
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  /* =======================
     FILE HANDLING
  ======================= */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const removeFile = () => setFile(null);

  /* =======================
     KEYWORDS & AUTHORS
  ======================= */
  const addKeyword = () => {
    if (currentKeyword.trim() && !formData.keywords.includes(currentKeyword.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, currentKeyword.trim()] });
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
  };

  const addCoAuthor = () => {
    if (currentCoAuthor.trim()) {
      setFormData({ ...formData, coAuthors: [...formData.coAuthors, currentCoAuthor.trim()] });
      setCurrentCoAuthor('');
    }
  };

  const removeCoAuthor = (index) => {
    setFormData({
      ...formData,
      coAuthors: formData.coAuthors.filter((_, i) => i !== index)
    });
  };

  /* =======================
     VALIDATION
  ======================= */
  const validateStep1 = () => {
    if (!formData.title.trim() || !formData.subjectArea) {
      setError('Research title and subject area are required');
      setTouched({ title: true, subjectArea: true, abstract: false });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.abstract.trim().length < 100) {
      setError('Abstract must be at least 100 characters');
      setTouched({ ...touched, abstract: true });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a PDF file');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();

      data.append('file', file);
      data.append('title', formData.title);
      data.append('authors', JSON.stringify([...formData.authors, ...formData.coAuthors]));
      data.append('abstract', formData.abstract);
      data.append('keywords', JSON.stringify(formData.keywords));
      data.append('category', formData.category);
      data.append('subjectArea', formData.subjectArea);
      data.append('yearCompleted', formData.yearCompleted);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/research`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });

      if (res.ok) {
        localStorage.removeItem('research-draft');
        showToast('🎉 Research submitted successfully!', 'success');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 3000);
      } else {
        setError('Submission failed');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <>
      {toast.show && (
        <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

          {/* AUTO-SAVE */}
          <DraftManager
            draftKey="research-draft"
            data={formData}
            onRestore={setFormData}
          />

          {/* HEADER */}
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">Submit Research Paper</h2>
            <button onClick={onClose}><X /></button>
          </div>

          {/* PROGRESS */}
          <div className="px-6 pt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-navy rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm mt-2 text-gray-500">Step {step} of 3</p>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded flex gap-2">
              <AlertTriangle size={18} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <label className="flex items-center gap-2 font-semibold">
                  Research Title *
                  <InfoIcon content="Enter the full title of your research paper" />
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <label className="flex items-center gap-2 font-semibold">
                  Abstract *
                  <Tooltip text="Minimum 100 characters" />
                </label>
                <textarea
                  rows={8}
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <label className="flex items-center gap-2 font-semibold">
                  Upload PDF *
                  <InfoIcon content="PDF only, max 10MB, IMRaD format required" />
                </label>
                <input type="file" accept=".pdf" onChange={handleFileChange} />
              </>
            )}

            {/* NAVIGATION */}
            <div className="flex justify-between pt-4 border-t">
              <button type="button" onClick={() => step === 1 ? onClose() : setStep(step - 1)}>
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              {step < 3 ? (
                <button type="button" onClick={handleNext}>Next</button>
              ) : (
                <button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Research'}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default SubmitResearch;
