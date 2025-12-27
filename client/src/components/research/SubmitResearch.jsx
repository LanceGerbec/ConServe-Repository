// client/src/components/research/SubmitResearch.jsx
import { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  X,
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
  Eye
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import Toast from '../common/Toast';
import InfoIcon from '../common/InfoIcon';
import Tooltip from '../common/Tooltip';
import DraftManager from '../common/DraftManager';
import ConfirmModal from '../common/ConfirmModal';

const MIN_ABSTRACT = 100;

const SubmitResearch = ({ onClose, onSuccess }) => {
  const { user } = useAuth();

  /* =======================
     STATE
  ======================= */
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
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

  /* =======================
     DERIVED
  ======================= */
  const progress = (step / 3) * 100;
  const abstractCount = formData.abstract.length;
  const abstractProgress = Math.min((abstractCount / MIN_ABSTRACT) * 100, 100);
  const hasUnsavedData =
    formData.title ||
    formData.abstract ||
    formData.keywords.length ||
    file;

  /* =======================
     HELPERS
  ======================= */
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  /* =======================
     FILE HANDLING
  ======================= */
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
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError('');
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  /* =======================
     KEYWORDS
  ======================= */
  const [currentKeyword, setCurrentKeyword] = useState('');

  const addKeyword = () => {
    if (
      currentKeyword.trim() &&
      !formData.keywords.includes(currentKeyword.trim())
    ) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, currentKeyword.trim()]
      });
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
  };

  /* =======================
     VALIDATION
  ======================= */
  const validateStep1 = () => {
    if (!formData.title.trim() || !formData.subjectArea) {
      setError('Title and subject area are required');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (abstractCount < MIN_ABSTRACT) {
      setError(`Abstract must be at least ${MIN_ABSTRACT} characters`);
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
     CLOSE WITH CONFIRM
  ======================= */
  const handleClose = () => {
    if (hasUnsavedData) setShowConfirm(true);
    else onClose();
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
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/research`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data
        }
      );

      if (res.ok) {
        localStorage.removeItem('research-draft');
        showToast('🎉 Research submitted successfully!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2500);
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

      {showConfirm && (
        <ConfirmModal
          title="Discard draft?"
          message="You have unsaved changes. Are you sure you want to exit?"
          onConfirm={onClose}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

          {/* AUTO SAVE */}
          <DraftManager
            draftKey="research-draft"
            data={formData}
            onRestore={setFormData}
          />

          {/* HEADER */}
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">Submit Research Paper</h2>
            <button onClick={handleClose}><X /></button>
          </div>

          {/* PROGRESS */}
          <div className="px-6 pt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-navy rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm mt-2 text-gray-500">
              Step {step} of 3
            </p>
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
                <label className="font-semibold flex gap-2">
                  Research Title *
                  <InfoIcon content="Full research paper title" />
                </label>
                <input
                  className="w-full border rounded-xl px-4 py-3"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <label className="font-semibold flex gap-2">
                  Abstract *
                  <Tooltip text="Minimum 100 characters" />
                </label>

                <textarea
                  rows={8}
                  className="w-full border rounded-xl px-4 py-3"
                  value={formData.abstract}
                  onChange={e =>
                    setFormData({ ...formData, abstract: e.target.value })
                  }
                />

                <div className="flex justify-between text-sm">
                  <span>
                    {abstractCount} / {MIN_ABSTRACT} characters
                  </span>
                  <span
                    className={
                      abstractCount >= MIN_ABSTRACT
                        ? 'text-green-600'
                        : 'text-red-500'
                    }
                  >
                    {abstractCount >= MIN_ABSTRACT ? 'Valid' : 'Too short'}
                  </span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full transition-all"
                    style={{ width: `${abstractProgress}%` }}
                  />
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <label className="font-semibold flex gap-2">
                  Upload PDF *
                  <InfoIcon content="PDF only, max 10MB" />
                </label>

                <input type="file" accept=".pdf" onChange={handleFileChange} />

                {file && (
                  <div className="flex items-center gap-4 mt-3">
                    <FileText />
                    <span className="text-sm">{file.name}</span>

                    {previewUrl && (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 flex gap-1"
                      >
                        <Eye size={16} /> Preview
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* NAV */}
            <div className="flex justify-between pt-4 border-t">
              <button
                type="button"
                onClick={() =>
                  step === 1 ? handleClose() : setStep(step - 1)
                }
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              {step < 3 ? (
                <button type="button" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex gap-2 items-center"
                >
                  {loading && <Loader2 className="animate-spin" size={16} />}
                  Submit Research
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
