import { useState } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2, Plus, Trash2, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../common/Toast';
import DraftManager from '../common/DraftManager';

const SubmitResearch = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [touched, setTouched] = useState({ title: false, subjectArea: false, abstract: false });

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

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
  const progress = (step / 3) * 100;

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

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

  const handleFile = (f) => {
    if (f.type !== 'application/pdf') return setError('Only PDF files allowed');
    if (f.size > 10 * 1024 * 1024) return setError('File must be under 10MB');
    setFile(f);
    setError('');
  };

  const addKeyword = () => {
    if (currentKeyword.trim() && !formData.keywords.includes(currentKeyword.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, currentKeyword.trim()] });
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (k) => setFormData({ ...formData, keywords: formData.keywords.filter(x => x !== k) });

  const addCoAuthor = () => {
    if (currentCoAuthor.trim()) {
      setFormData({ ...formData, coAuthors: [...formData.coAuthors, currentCoAuthor.trim()] });
      setCurrentCoAuthor('');
    }
  };

  const removeCoAuthor = (i) => setFormData({ ...formData, coAuthors: formData.coAuthors.filter((_, idx) => idx !== i) });

  const validateStep1 = () => {
    if (!formData.title.trim() || !formData.subjectArea) {
      setError('Title and subject area required');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please upload a PDF file');

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

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* DRAFT MANAGER */}
          <div className="px-6 pt-6">
            <DraftManager draftKey="research-draft" data={formData} onRestore={setFormData} />
          </div>

          {/* HEADER */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Research Paper</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Step {step} of 3</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              <X size={24} />
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div className="px-6 py-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-2 bg-navy transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded flex items-start gap-2">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* STEP 1 */}
            {step === 1 && (
              <>
                {/* TITLE */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Research Title *
                    <div className="group relative">
                      <button type="button" className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                        <Info size={14} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        Enter the full title of your research paper
                      </div>
                    </div>
                  </label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none ${
                      touched.title && !formData.title.trim()
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-navy'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="e.g., Effects of Music Therapy on Post-Operative Pain Management"
                  />
                </div>

                {/* CATEGORY & YEAR */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                      <div className="group relative">
                        <button type="button" className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                          <Info size={14} className="text-blue-600 dark:text-blue-400" />
                        </button>
                        <div className="absolute left-0 top-full mt-1 w-48 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          Select research category
                        </div>
                      </div>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option>Completed</option>
                      <option>Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Year Completed *
                      <div className="group relative">
                        <button type="button" className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                          <Info size={14} className="text-blue-600 dark:text-blue-400" />
                        </button>
                        <div className="absolute left-0 top-full mt-1 w-48 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          Year your research was completed
                        </div>
                      </div>
                    </label>
                    <select
                      value={formData.yearCompleted}
                      onChange={(e) => setFormData({ ...formData, yearCompleted: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {/* SUBJECT AREA */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Subject Area *
                    <div className="group relative">
                      <button type="button" className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                        <Info size={14} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <div className="absolute left-0 top-full mt-1 w-52 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        Primary nursing specialty area
                      </div>
                    </div>
                  </label>
                  <select
                    value={formData.subjectArea}
                    onChange={(e) => setFormData({ ...formData, subjectArea: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none ${
                      touched.subjectArea && !formData.subjectArea
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-navy'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  >
                    <option value="">Select subject area</option>
                    {subjectAreas.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* CO-AUTHORS */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Co-Authors (Optional)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={currentCoAuthor}
                      onChange={(e) => setCurrentCoAuthor(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCoAuthor())}
                      placeholder="Enter co-author name"
                      className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addCoAuthor}
                      className="px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-800 transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.coAuthors.map((a, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {a}
                        <button type="button" onClick={() => removeCoAuthor(i)} className="hover:text-red-600 transition">
                          <Trash2 size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                {/* ABSTRACT */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Abstract *
                    <div className="group relative">
                      <button type="button" className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                        <Info size={14} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <div className="absolute left-0 top-full mt-1 w-72 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        Minimum 100 characters. Summarize your research objectives, methods, results, and conclusions.
                      </div>
                    </div>
                  </label>
                  <textarea
                    rows={8}
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none resize-none ${
                      touched.abstract && formData.abstract.length < 100
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-navy'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="Provide a comprehensive summary of your research..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.abstract.length}/100 characters minimum
                  </p>
                </div>

                {/* KEYWORDS */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Keywords
                    <div className="group relative">
                      <button type="button" className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                        <Info size={14} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        Add 3-8 keywords to help others discover your research
                      </div>
                    </div>
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      placeholder="Enter keyword"
                      className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-800 transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((k, i) => (
                      <span
                        key={i}
                        className="bg-navy/10 text-navy dark:bg-navy/20 dark:text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {k}
                        <button type="button" onClick={() => removeKeyword(k)} className="hover:text-red-600 transition">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upload PDF *
                  <div className="group relative">
                    <button type="button" className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                      <Info size={14} className="text-blue-600 dark:text-blue-400" />
                    </button>
                    <div className="absolute left-0 top-full mt-1 w-80 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      PDF only, max 10MB. Must be in IMRaD format (Introduction, Methods, Results, and Discussion)
                    </div>
                  </div>
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                    dragActive
                      ? 'border-navy bg-navy/5 dark:bg-navy/10'
                      : file
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="pdf-upload" />

                  {file ? (
                    <div className="flex items-center justify-between gap-3">
                      <FileText className="text-green-600 dark:text-green-400 flex-shrink-0" size={32} />
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 transition flex-shrink-0"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="pdf-upload" className="cursor-pointer block">
                      <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">
                        {dragActive ? 'Drop here!' : 'Drag & drop PDF or click to browse'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Max 10MB, PDF only</p>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition text-gray-700 dark:text-gray-300"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 font-semibold shadow-lg transition"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Submit Research
                    </>
                  )}
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