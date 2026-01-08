import { useState, useEffect } from 'react';
import { X, Upload, Plus, Edit2, User } from 'lucide-react';
import Toast from '../common/Toast';

const EditResearch = ({ research, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    authors: [],
    abstract: '',
    keywords: [],
    category: '',
    subjectArea: '',
    customSubjectArea: '',
    yearCompleted: new Date().getFullYear()
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const API_URL = import.meta.env.VITE_API_URL;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const subjectAreas = [
    'Pediatric Nursing', 'Adult Health Nursing', 'Maternal and Child Nursing',
    'Community Health Nursing', 'Mental Health Nursing', 'Nursing Informatics',
    'Geriatric Nursing', 'Critical Care Nursing', 'Oncology Nursing',
    'Surgical Nursing', 'Emergency Nursing', 'Public Health Nursing', 'Other'
  ];

  useEffect(() => {
    if (research) {
      const isOther = !subjectAreas.slice(0, -1).includes(research.subjectArea);
      setFormData({
        title: research.title || '',
        authors: research.authors || [],
        abstract: research.abstract || '',
        keywords: research.keywords || [],
        category: research.category || '',
        subjectArea: isOther ? 'Other' : research.subjectArea || '',
        customSubjectArea: isOther ? research.subjectArea : '',
        yearCompleted: research.yearCompleted || currentYear
      });
    }
  }, [research, currentYear]);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
  };

  const handleAddAuthor = () => {
    if (newAuthor.trim() && !formData.authors.includes(newAuthor.trim())) {
      setFormData({ ...formData, authors: [...formData.authors, newAuthor.trim()] });
      setNewAuthor('');
    }
  };

  const handleRemoveAuthor = (author) => {
    setFormData({ ...formData, authors: formData.authors.filter(a => a !== author) });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Only PDF files are allowed', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('File must be less than 10MB', 'error');
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubjectAreaChange = (e) => {
    const value = e.target.value;
    setFormData({ 
      ...formData, 
      subjectArea: value,
      customSubjectArea: value === 'Other' ? formData.customSubjectArea : ''
    });
  };

  const showToast = (msg, type) => setToast({ show: true, message: msg, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return showToast('Title is required', 'error');
    if (formData.authors.length === 0) return showToast('At least one author is required', 'error');
    if (!formData.abstract.trim()) return showToast('Abstract is required', 'error');
    if (formData.abstract.trim().length < 100) return showToast('Abstract must be at least 100 characters', 'error');
    if (formData.keywords.length === 0) return showToast('At least one keyword is required', 'error');
    if (!formData.category) return showToast('Category is required', 'error');
    if (formData.subjectArea === 'Other' && !formData.customSubjectArea.trim()) {
      return showToast('Please specify the subject area', 'error');
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      data.append('title', formData.title.trim());
      data.append('authors', JSON.stringify(formData.authors));
      data.append('abstract', formData.abstract.trim());
      data.append('keywords', JSON.stringify(formData.keywords));
      data.append('category', formData.category);
      data.append('subjectArea', formData.subjectArea === 'Other' ? formData.customSubjectArea.trim() : formData.subjectArea);
      data.append('yearCompleted', formData.yearCompleted);
      
      if (pdfFile) data.append('file', pdfFile);

      const res = await fetch(`${API_URL}/research/${research._id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const result = await res.json();

      if (res.ok) {
        showToast('Research updated successfully!', 'success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        showToast(result.error || 'Update failed', 'error');
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-scale-in border-2 border-blue-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Edit2 size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Edit Research Paper</h2>
                  <p className="text-sm text-blue-100">Make changes and resubmit</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X size={24} className="text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Research Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter research title"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            {/* Authors */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User size={16} />
                Authors *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAuthor())}
                  placeholder="Enter author name"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none bg-white dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={handleAddAuthor}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.authors.map((author, idx) => (
                  <span key={idx} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg font-semibold flex items-center gap-2 group">
                    {author}
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(author)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-1 transition"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              {formData.authors.length === 0 && (
                <p className="text-xs text-red-500 mt-2">At least one author is required</p>
              )}
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Abstract * (100-500 words)
              </label>
              <textarea
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                placeholder="Enter research abstract"
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none bg-white dark:bg-gray-900 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.abstract.length}/500 characters {formData.abstract.length < 100 && '(minimum 100)'}
              </p>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Keywords *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  placeholder="Enter keyword"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none bg-white dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, idx) => (
                  <span key={idx} className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg font-semibold flex items-center gap-2">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded p-1 transition"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Category & Subject Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none bg-white dark:bg-gray-900"
                >
                  <option value="">Select Category</option>
                  <option value="Completed">Completed</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Subject Area
                </label>
                <select
                  value={formData.subjectArea}
                  onChange={handleSubjectAreaChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none bg-white dark:bg-gray-900"
                >
                  <option value="">Select Subject Area</option>
                  {subjectAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Subject Area (shown when "Other" is selected) */}
            {formData.subjectArea === 'Other' && (
              <div className="animate-slide-up">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Specify Subject Area *
                </label>
                <input
                  type="text"
                  value={formData.customSubjectArea}
                  onChange={(e) => setFormData({ ...formData, customSubjectArea: e.target.value })}
                  placeholder="Enter custom subject area"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none bg-white dark:bg-gray-900"
                />
              </div>
            )}

            {/* Year Completed */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Year Completed
              </label>
              <select
                value={formData.yearCompleted}
                onChange={(e) => setFormData({ ...formData, yearCompleted: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none bg-white dark:bg-gray-900"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* PDF File */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                PDF File {pdfFile ? '(New file selected)' : '(Optional - leave empty to keep current file)'}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex items-center justify-center gap-3 w-full px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 transition cursor-pointer bg-gray-50 dark:bg-gray-900"
                >
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {pdfFile ? pdfFile.name : 'Click to upload new PDF (optional)'}
                  </span>
                </label>
              </div>
              {pdfFile && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  ✓ New file selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Edit2 size={18} />
                  Update Research
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditResearch;