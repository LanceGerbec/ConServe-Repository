import { useState, useCallback, useEffect } from 'react';
import { Edit3, X, CheckCircle, Loader2, Upload, FileText, AlertTriangle, Trash2 } from 'lucide-react';
import Toast from '../common/Toast';

const EditResearch = ({ research, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [file, setFile] = useState(null);
  const [keepCurrentPDF, setKeepCurrentPDF] = useState(true);
  
  const [formData, setFormData] = useState({
    title: research.title || '',
    authors: research.authors || [],
    abstract: research.abstract || '',
    keywords: research.keywords || [],
    category: research.category || 'Completed',
    subjectArea: research.subjectArea || '',
    yearCompleted: research.yearCompleted || new Date().getFullYear()
  });

  const [currentKeyword, setCurrentKeyword] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  }, []);

  const addKeyword = useCallback(() => {
    const trimmed = currentKeyword.trim();
    if (trimmed && !formData.keywords.includes(trimmed)) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, trimmed] }));
      setCurrentKeyword('');
    }
  }, [currentKeyword, formData.keywords]);

  const removeKeyword = useCallback((k) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(x => x !== k) }));
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    if (f.type !== 'application/pdf') {
      setError('Only PDF files allowed');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }
    
    setFile(f);
    setKeepCurrentPDF(false);
    setError('');
    showToast(`✓ New PDF selected: ${f.name}`, 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.abstract.trim()) {
      setError('Title and abstract are required');
      return;
    }
    
    if (formData.abstract.length < 100) {
      setError('Abstract must be at least 100 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      data.append('title', formData.title);
      data.append('authors', JSON.stringify(formData.authors));
      data.append('abstract', formData.abstract);
      data.append('keywords', JSON.stringify(formData.keywords));
      data.append('category', formData.category);
      data.append('subjectArea', formData.subjectArea);
      data.append('yearCompleted', formData.yearCompleted);
      
      if (file) data.append('file', file);

      const res = await fetch(`${API_URL}/research/${research._id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const result = await res.json();

      if (res.ok) {
        showToast('✓ Research updated successfully', 'success');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Update failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full my-8 shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 z-10 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Edit3 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Edit Research Paper</h2>
                  <p className="text-blue-100 text-sm">Make changes and resubmit</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition" disabled={loading}>
                <X size={24} />
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded flex items-start gap-2">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {research.status === 'revision' && (
            <div className="mx-6 mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm font-semibold mb-2">
                ⚠️ Revision Requested
              </p>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                {research.revisionNotes || 'Admin requested changes to this paper'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Research Title *
              </label>
              <input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter research title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-600 focus:outline-none bg-white dark:bg-gray-700"
                >
                  <option>Completed</option>
                  <option>Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Year Completed *
                </label>
                <select 
                  value={formData.yearCompleted} 
                  onChange={(e) => setFormData({ ...formData, yearCompleted: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-600 focus:outline-none bg-white dark:bg-gray-700"
                >
                  {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Abstract *
              </label>
              <textarea 
                rows={6} 
                value={formData.abstract} 
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none resize-none bg-white dark:bg-gray-700"
                placeholder="Provide a comprehensive summary..."
              />
              <p className={`text-xs mt-2 ${formData.abstract.length >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                {formData.abstract.length}/100 characters minimum
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Keywords
              </label>
              <div className="flex gap-2 mb-3">
                <input 
                  value={currentKeyword} 
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Enter keyword"
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-600 focus:outline-none bg-white dark:bg-gray-700"
                />
                <button 
                  type="button" 
                  onClick={addKeyword} 
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
                >
                  Add
                </button>
              </div>
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((k, i) => (
                    <span key={i} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                      {k}
                      <button type="button" onClick={() => removeKeyword(k)} className="hover:text-red-600">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                PDF File
              </label>
              
              {keepCurrentPDF ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-600" size={32} />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">Current PDF</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{research.fileName || 'Existing file'}</p>
                      </div>
                    </div>
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition cursor-pointer text-sm font-semibold">
                      Replace PDF
                      <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Upload className="text-green-600" size={32} />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">New PDF Selected</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{file?.name}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setFile(null); setKeepCurrentPDF(true); }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition text-gray-700 dark:text-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
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