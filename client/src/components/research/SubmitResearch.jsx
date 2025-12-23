// client/src/components/research/SubmitResearch.jsx
import { useState } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2, Plus, Trash2, AlertTriangle } from 'lucide-react';
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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // DRAG AND DROP HANDLERS
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const removeFile = () => {
    setFile(null);
    setError('');
  };

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
    if (currentCoAuthor.trim() && !formData.coAuthors.includes(currentCoAuthor.trim())) {
      setFormData({ ...formData, coAuthors: [...formData.coAuthors, currentCoAuthor.trim()] });
      setCurrentCoAuthor('');
    }
  };

  const removeCoAuthor = (index) => {
    setFormData({ ...formData, coAuthors: formData.coAuthors.filter((_, i) => i !== index) });
  };

  // VALIDATION FUNCTIONS
  const validateStep1 = () => {
    const errors = [];
    if (!formData.title.trim()) errors.push('Research Title is required');
    if (!formData.subjectArea) errors.push('Subject Area is required');
    if (errors.length > 0) {
      setError(errors.join('. '));
      setTouched({ title: true, subjectArea: true, abstract: false });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.abstract.trim()) {
      setError('Abstract is required');
      setTouched({ ...touched, abstract: true });
      return false;
    }
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
    if (!file) {
      setError('Please upload a PDF file in IMRaD format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title);
      
      const allAuthors = [...formData.authors, ...formData.coAuthors];
      data.append('authors', JSON.stringify(allAuthors));
      
      data.append('abstract', formData.abstract);
      data.append('keywords', JSON.stringify(formData.keywords));
      data.append('category', formData.category);
      data.append('subjectArea', formData.subjectArea);
      data.append('yearCompleted', formData.yearCompleted);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/research`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const result = await res.json();
      if (res.ok) {
        showToast('🎉 Research submitted successfully! Your paper is now pending admin review. You will receive a notification once it has been reviewed.', 'success');
        
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 3000);
      } else {
        setError(result.error || 'Submission failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <>
      {toast.show && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
          duration={5000}
        />
      )}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Research Paper</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-navy h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Step {step} of 3</p>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded flex items-start">
              <AlertTriangle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Research Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onBlur={() => setTouched({ ...touched, title: true })}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${
                      touched.title && !formData.title.trim()
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-navy'
                    }`}
                    placeholder="Enter your research title"
                  />
                  {touched.title && !formData.title.trim() && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Primary Author <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600">
                    <p className="text-gray-900 dark:text-white font-medium">{formData.authors[0]}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You (Primary Author)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Co-Authors
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentCoAuthor}
                      onChange={(e) => setCurrentCoAuthor(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCoAuthor())}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Add co-author name"
                    />
                    <button
                      type="button"
                      onClick={addCoAuthor}
                      className="px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-800 transition flex items-center gap-2 font-semibold"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                  {formData.coAuthors.length > 0 && (
                    <div className="space-y-2">
                      {formData.coAuthors.map((coAuthor, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                          <span className="text-gray-900 dark:text-white">{coAuthor}</span>
                          <button
                            type="button"
                            onClick={() => removeCoAuthor(i)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Year Completed <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.yearCompleted}
                      onChange={(e) => setFormData({ ...formData, yearCompleted: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Subject Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subjectArea}
                    onBlur={() => setTouched({ ...touched, subjectArea: true })}
                    onChange={(e) => setFormData({ ...formData, subjectArea: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${
                      touched.subjectArea && !formData.subjectArea
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-navy'
                    }`}
                  >
                    <option value="">Please select an item in the list</option>
                    {subjectAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  {touched.subjectArea && !formData.subjectArea && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Please select a subject area
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Abstract <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={8}
                    value={formData.abstract}
                    onBlur={() => setTouched({ ...touched, abstract: true })}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition ${
                      touched.abstract && (!formData.abstract.trim() || formData.abstract.trim().length < 100)
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-navy'
                    }`}
                    placeholder="Enter your research abstract (minimum 100 characters)..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    {touched.abstract && (!formData.abstract.trim() || formData.abstract.trim().length < 100) && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {!formData.abstract.trim() ? 'Abstract is required' : 'Minimum 100 characters required'}
                      </p>
                    )}
                    <p className={`text-xs ml-auto ${
                      formData.abstract.trim().length >= 100 
                        ? 'text-green-600 dark:text-green-400 font-semibold' 
                        : 'text-gray-500'
                    }`}>
                      {formData.abstract.trim().length} / 100 characters
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Keywords (Optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Add keyword and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-800 transition font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  {formData.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword, i) => (
                        <span key={i} className="bg-navy/10 text-navy dark:bg-navy/20 dark:text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2 font-medium">
                          {keyword}
                          <button type="button" onClick={() => removeKeyword(keyword)} className="hover:bg-navy/20 dark:hover:bg-navy/30 rounded-full p-0.5 transition">
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
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Upload PDF <span className="text-red-500">*</span>
                  </label>
                  
                  {/* DRAG AND DROP ZONE */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      dragActive 
                        ? 'border-navy bg-navy/5 dark:bg-navy/10 scale-105' 
                        : file 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-navy hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    
                    {file ? (
                      <div className="flex items-center justify-center gap-4">
                        <FileText className="text-green-600 dark:text-green-400" size={40} />
                        <div className="text-left flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-lg">{file.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <div className="flex gap-2">
                          <CheckCircle className="text-green-500" size={28} />
                          <button
                            type="button"
                            onClick={removeFile}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <Upload className={`mx-auto mb-4 transition-all duration-300 ${
                          dragActive ? 'text-navy scale-110' : 'text-gray-400'
                        }`} size={56} />
                        <p className="text-gray-900 dark:text-white font-semibold mb-2 text-lg">
                          {dragActive ? 'Drop your PDF here!' : 'Drag & drop your PDF here'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">or</p>
                        <span className="inline-block bg-navy text-white px-6 py-2 rounded-lg font-semibold hover:bg-navy-800 transition">
                          Browse Files
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Maximum file size: 10MB</p>
                      </label>
                    )}
                  </div>

                  {/* IMRAD FORMAT NOTICE */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg mt-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <FileText size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold">Required Format:</strong> Your research paper must follow the <strong>IMRaD format</strong> (Introduction, Methods, Results, and Discussion). Papers not in this format may be rejected.
                      </span>
                    </p>
                  </div>

                  {/* REVIEW NOTE */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg mt-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <AlertTriangle size={18} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold">Note:</strong> Your research will be reviewed by the admin before being published. You will receive an email notification once your submission has been reviewed.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold text-gray-700 dark:text-gray-300"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 transition font-semibold shadow-lg hover:shadow-xl"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Research</span>
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