import { useState } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SubmitResearch = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    authors: [user?.firstName + ' ' + user?.lastName || ''],
    coAuthors: [],
    abstract: '',
    keywords: [],
    category: 'Completed',
    subjectArea: ''
  });

  const [currentKeyword, setCurrentKeyword] = useState('');
  const [currentCoAuthor, setCurrentCoAuthor] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a PDF file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title);
      
      // Combine main author and co-authors
      const allAuthors = [...formData.authors, ...formData.coAuthors];
      data.append('authors', JSON.stringify(allAuthors));
      
      data.append('abstract', formData.abstract);
      data.append('keywords', JSON.stringify(formData.keywords));
      data.append('category', formData.category);
      data.append('subjectArea', formData.subjectArea);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/research`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const result = await res.json();
      if (res.ok) {
        onSuccess?.();
        onClose();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Research Paper</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-navy h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Step {step} of 3</p>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Basic Info + Authors */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Research Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your research title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Primary Author <span className="text-red-500">*</span>
                </label>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-xl">
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
                    placeholder="Add co-author name and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addCoAuthor}
                    className="px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-800 transition flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
                {formData.coAuthors.length > 0 && (
                  <div className="space-y-2">
                    {formData.coAuthors.map((coAuthor, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        <span className="text-gray-900 dark:text-white">{coAuthor}</span>
                        <button
                          type="button"
                          onClick={() => removeCoAuthor(i)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
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
                  Subject Area
                </label>
                <input
                  type="text"
                  value={formData.subjectArea}
                  onChange={(e) => setFormData({ ...formData, subjectArea: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Pediatric Nursing, Mental Health"
                />
              </div>
            </div>
          )}

          {/* Step 2: Abstract & Keywords */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Abstract <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Enter your research abstract..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Keywords
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
                    className="px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-800 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, i) => (
                    <span key={i} className="bg-navy/10 text-navy px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {keyword}
                      <button type="button" onClick={() => removeKeyword(keyword)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: File Upload */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upload PDF <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="text-navy" size={32} />
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <CheckCircle className="text-green-500" size={24} />
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">Click to upload PDF</p>
                        <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Note:</strong> Your research will be reviewed by the admin before being published.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !file}
                className="px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 transition disabled:opacity-50 flex items-center gap-2"
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
  );
};

export default SubmitResearch;