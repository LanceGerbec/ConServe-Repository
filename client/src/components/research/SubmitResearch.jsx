import { useState, useCallback, useMemo } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2, Plus, Trash2, AlertTriangle, Info, ChevronRight, ChevronLeft, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../common/Toast';

const SubmitResearch = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [uploadOnBehalf, setUploadOnBehalf] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    authors: uploadOnBehalf ? [] : [user?.firstName + ' ' + user?.lastName || ''],
    coAuthors: [],
    abstract: '',
    keywords: [],
    category: 'Completed',
    subjectArea: '',
    customSubjectArea: '',
    yearCompleted: new Date().getFullYear()
  });
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [currentCoAuthor, setCurrentCoAuthor] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const subjectAreas = useMemo(() => [
    'Pediatric Nursing', 'Adult Health Nursing', 'Maternal and Child Nursing',
    'Community Health Nursing', 'Mental Health Nursing', 'Nursing Informatics',
    'Geriatric Nursing', 'Critical Care Nursing', 'Oncology Nursing',
    'Surgical Nursing', 'Emergency Nursing', 'Public Health Nursing', 'Other'
  ], []);

  const years = useMemo(() => 
    Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i),
    []
  );

  const progress = useMemo(() => (step / 3) * 100, [step]);

  const canUploadOnBehalf = useMemo(() => 
    user?.role === 'admin' || 
    user?.role === 'faculty' || 
    user?.canUploadOnBehalf === true,
    [user]
  );

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  }, []);

  const handleToggleUploadOnBehalf = useCallback((checked) => {
    setUploadOnBehalf(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, authors: [], coAuthors: [] }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        authors: [user?.firstName + ' ' + user?.lastName || ''],
        coAuthors: []
      }));
    }
  }, [user]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileChange = useCallback((e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }, []);

  const handleFile = useCallback((f) => {
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }
    setFile(f);
    setError('');
    showToast(`✓ ${f.name} selected`, 'success');
  }, [showToast]);

  const addKeyword = useCallback(() => {
    const trimmed = currentKeyword.trim();
    if (trimmed && !formData.keywords.includes(trimmed)) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, trimmed] }));
      setCurrentKeyword('');
      showToast('✓ Keyword added', 'success');
    }
  }, [currentKeyword, formData.keywords, showToast]);

  const removeKeyword = useCallback((k) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(x => x !== k) }));
  }, []);

  const addCoAuthor = useCallback(() => {
    const trimmed = currentCoAuthor.trim();
    if (trimmed) {
      if (uploadOnBehalf) {
        setFormData(prev => ({ ...prev, authors: [...prev.authors, trimmed] }));
      } else {
        setFormData(prev => ({ ...prev, coAuthors: [...prev.coAuthors, trimmed] }));
      }
      setCurrentCoAuthor('');
      showToast('✓ Author added', 'success');
    }
  }, [currentCoAuthor, uploadOnBehalf, showToast]);

  const removeCoAuthor = useCallback((i) => {
    if (uploadOnBehalf) {
      setFormData(prev => ({ ...prev, authors: prev.authors.filter((_, idx) => idx !== i) }));
    } else {
      setFormData(prev => ({ ...prev, coAuthors: prev.coAuthors.filter((_, idx) => idx !== i) }));
    }
  }, [uploadOnBehalf]);

  const validateStep1 = useCallback(() => {
    const subject = formData.subjectArea === 'Other' ? formData.customSubjectArea.trim() : formData.subjectArea;
    if (!formData.title.trim() || !subject) {
      setError('Title and subject area are required');
      return false;
    }
    if (uploadOnBehalf && formData.authors.length === 0) {
      setError('Please add at least one author');
      return false;
    }
    setError('');
    return true;
  }, [formData, uploadOnBehalf]);

  const validateStep2 = useCallback(() => {
    if (formData.abstract.trim().length < 100) {
      setError('Abstract must be at least 100 characters');
      return false;
    }
    setError('');
    return true;
  }, [formData.abstract]);

  const handleNext = useCallback(() => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setError('');
    setStep(s => s + 1);
  }, [step, validateStep1, validateStep2]);

  const handleBack = useCallback(() => {
    setError('');
    setStep(s => s - 1);
  }, []);

  const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  if (!file) {
    setError('Please upload a PDF file');
    return;
  }

  setLoading(true);
  setUploadProgress(0);

  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Session expired. Please login again.');
      setLoading(false);
      setTimeout(() => window.location.href = '/login', 2000);
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    
    if (uploadOnBehalf) {
      data.append('authors', JSON.stringify(formData.authors));
      data.append('uploadOnBehalf', 'true');
      data.append('actualAuthors', JSON.stringify(formData.authors));
    } else {
      data.append('authors', JSON.stringify([...formData.authors, ...formData.coAuthors]));
      data.append('uploadOnBehalf', 'false');
    }
    
    data.append('abstract', formData.abstract);
    data.append('keywords', JSON.stringify(formData.keywords));
    data.append('category', formData.category);
    data.append('subjectArea', formData.subjectArea === 'Other' ? formData.customSubjectArea : formData.subjectArea);
    data.append('yearCompleted', formData.yearCompleted);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201) {
        showToast('🎉 Research submitted successfully!', 'success');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else if (xhr.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        setLoading(false);
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          setError(errorData.error || 'Submission failed');
        } catch {
          setError('Submission failed. Please try again.');
        }
        setLoading(false);
      }
    };

    xhr.onerror = () => {
      setError('Connection error. Please check your internet and try again.');
      setLoading(false);
    };

    xhr.ontimeout = () => {
      setError('Request timeout. Please try again.');
      setLoading(false);
    };

    xhr.timeout = 60000; // 60 second timeout

    xhr.open('POST', `${import.meta.env.VITE_API_URL}/research`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    
    console.log('📤 Submitting research with token:', token.substring(0, 20) + '...');
    xhr.send(data);

  } catch (err) {
    console.error('Submit error:', err);
    setError(err.message || 'Submission failed. Please try again.');
    setLoading(false);
  }
}, [file, formData, uploadOnBehalf, onSuccess, onClose, showToast]);

  const InfoTooltip = useCallback(({ text }) => (
    <div className="group relative inline-block ml-1">
      <button type="button" className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
        <Info size={12} className="text-blue-600 dark:text-blue-400" />
      </button>
      <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
        {text}
      </div>
    </div>
  ), []);

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-navy to-accent text-white p-6 z-10 rounded-t-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Submit Research Paper</h2>
                  <p className="text-blue-100 text-sm">Step {step} of 3</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition" disabled={loading}>
                <X size={24} />
              </button>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="h-2 bg-white transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded flex items-start gap-2 animate-slide-up">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {step === 1 && (
              <div className="space-y-5 animate-slide-up">
                {canUploadOnBehalf && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uploadOnBehalf}
                        onChange={(e) => handleToggleUploadOnBehalf(e.target.checked)}
                        className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <UserPlus size={18} className="text-purple-600" />
                          <span className="font-bold text-gray-900 dark:text-white">Upload on behalf of someone else</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Check this box if you are uploading completed research on behalf of the original authors who do not have accounts.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Research Title *
                    <InfoTooltip text="Enter the full title of the research paper" />
                  </label>
                  <input 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    placeholder="e.g., Effects of Music Therapy on Post-Operative Pain Management"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                      <InfoTooltip text="Completed = thesis/capstone, Published = journal article" />
                    </label>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    >
                      <option>Completed</option>
                      <option>Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Year Completed *
                      <InfoTooltip text="Year the research was completed (2000-present)" />
                    </label>
                    <select 
                      value={formData.yearCompleted} 
                      onChange={(e) => setFormData({ ...formData, yearCompleted: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Subject Area *
                    <InfoTooltip text="Primary nursing specialty area" />
                  </label>
                  <select 
                    value={formData.subjectArea} 
                    onChange={(e) => setFormData({ ...formData, subjectArea: e.target.value, customSubjectArea: '' })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  >
                    <option value="">Select subject area</option>
                    {subjectAreas.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {formData.subjectArea === 'Other' && (
                    <input 
                      type="text" 
                      value={formData.customSubjectArea} 
                      onChange={(e) => setFormData({ ...formData, customSubjectArea: e.target.value })}
                      placeholder="Please specify the subject area" 
                      className="mt-3 w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition animate-slide-up"
                      autoFocus
                    />
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {uploadOnBehalf ? 'Authors *' : 'Co-Authors (Optional)'}
                    <InfoTooltip text={uploadOnBehalf ? 'Add all authors for this research' : 'Add any co-authors'} />
                  </label>
                  
                  {uploadOnBehalf && formData.authors.length === 0 && (
                    <div className="mb-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded">
                      <p className="text-xs text-yellow-800 dark:text-yellow-400">
                        ⚠️ Please add at least one author
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mb-3">
                    <input 
                      value={currentCoAuthor} 
                      onChange={(e) => setCurrentCoAuthor(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCoAuthor())}
                      placeholder={uploadOnBehalf ? "Enter author name" : "Enter co-author name"}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    />
                    <button 
                      type="button" 
                      onClick={addCoAuthor} 
                      className="px-5 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-800 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  {!uploadOnBehalf && formData.authors.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Primary Author:</p>
                      <span className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                        {formData.authors[0]}
                      </span>
                    </div>
                  )}

                  {((uploadOnBehalf && formData.authors.length > 0) || (!uploadOnBehalf && formData.coAuthors.length > 0)) && (
                    <div className="flex flex-wrap gap-2">
                      {(uploadOnBehalf ? formData.authors : formData.coAuthors).map((a, i) => (
                        <span 
                          key={i} 
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 animate-scale-in"
                        >
                          {a}
                          <button 
                            type="button" 
                            onClick={() => removeCoAuthor(i)} 
                            className="hover:text-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-slide-up">
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Abstract *
                    <InfoTooltip text="Minimum 100 characters. Summarize objectives, methods, results, and conclusions" />
                  </label>
                  <textarea 
                    rows={8} 
                    value={formData.abstract} 
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    placeholder="Provide a comprehensive summary..."
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-xs font-medium ${formData.abstract.length >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.abstract.length}/100 characters minimum
                    </p>
                    {formData.abstract.length >= 100 && (
                      <span className="text-xs text-green-600 flex items-center gap-1 animate-slide-up">
                        <CheckCircle size={14} /> Requirement met
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Keywords (Recommended: 3-8)
                    <InfoTooltip text="Press Enter or click Add after typing each keyword" />
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      value={currentKeyword} 
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      placeholder="Enter keyword"
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    />
                    <button 
                      type="button" 
                      onClick={addKeyword} 
                      className="px-5 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-800 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  {formData.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((k, i) => (
                        <span 
                          key={i} 
                          className="bg-navy/10 text-navy dark:bg-navy/20 dark:text-accent px-3 py-1.5 rounded-full text-sm flex items-center gap-2 animate-scale-in"
                        >
                          {k}
                          <button 
                            type="button" 
                            onClick={() => removeKeyword(k)} 
                            className="hover:text-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-slide-up">
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Upload PDF *
                    <InfoTooltip text="PDF only, max 10MB. Must be in IMRaD format" />
                  </label>
                  <div 
                    onDragEnter={handleDrag} 
                    onDragLeave={handleDrag} 
                    onDragOver={handleDrag} 
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      dragActive 
                        ? 'border-navy bg-navy/5 dark:bg-navy/10 scale-105' 
                        : file 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-navy hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                  >
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      id="pdf-upload" 
                    />
                    {file ? (
                      <div className="flex items-center justify-between gap-3">
                        <FileText className="text-green-600 dark:text-green-400 flex-shrink-0 animate-scale-in" size={40} />
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setFile(null)} 
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition flex-shrink-0"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="pdf-upload" className="cursor-pointer block">
                        <Upload className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          {dragActive ? '📄 Drop your PDF here!' : '📄 Drag & drop PDF or click to browse'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Maximum file size: 10MB • PDF format only
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                {loading && uploadProgress > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 animate-slide-up">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Uploading...</span>
                      <span className="text-sm font-bold text-navy dark:text-accent">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
<div
className="h-2 bg-navy dark:bg-accent transition-all duration-300 ease-out rounded-full" style={{ width: `${uploadProgress}%` }}
/>
</div>
</div>
)}

<div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                Review Your Submission
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 min-w-[100px]">Title:</span>
                  <span className="font-medium text-gray-900 dark:text-white line-clamp-2">{formData.title}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 min-w-[100px]">Authors:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {uploadOnBehalf 
                      ? formData.authors.join(', ') 
                      : [...formData.authors, ...formData.coAuthors].join(', ')
                    }
                  </span>
                </div>
                {uploadOnBehalf && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 min-w-[100px]">Uploaded by:</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {user?.firstName} {user?.lastName} (on behalf)
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 min-w-[100px]">Subject:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.subjectArea === 'Other' ? formData.customSubjectArea : formData.subjectArea}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 min-w-[100px]">Keywords:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.keywords.length > 0 ? formData.keywords.join(', ') : 'None'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 min-w-[100px]">File:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {file ? file.name : 'No file selected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={step === 1 ? onClose : handleBack}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition text-gray-700 dark:text-gray-300 flex items-center gap-2 disabled:opacity-50"
            disabled={loading}
          >
            {step === 1 ? <><X size={18} />Cancel</> : <><ChevronLeft size={18} />Back</>}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
            >
              Next Step<ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !file}
              className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition"
            >
              {loading ? <><Loader2 className="animate-spin" size={18} />Submitting...</> : <><CheckCircle size={18} />Submit Research</>}
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