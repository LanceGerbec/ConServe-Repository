// client/src/components/research/CitationModal.jsx
import { useState, useEffect } from 'react';
import { X, Copy, Check, FileText } from 'lucide-react';

const CitationModal = ({ paper, onClose }) => {
  const [style, setStyle] = useState('APA');
  const [copied, setCopied] = useState(false);
  const [citation, setCitation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateCitation();
  }, [style]);

  const generateCitation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${paper._id}/citation?style=${style}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCitation(data.citation);
    } catch (error) {
      console.error('Citation error:', error);
      setCitation('Error generating citation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const styles = [
    { id: 'APA', name: 'APA', desc: 'American Psychological Association' },
    { id: 'MLA', name: 'MLA', desc: 'Modern Language Association' },
    { id: 'Chicago', name: 'Chicago', desc: 'Chicago Manual of Style' },
    { id: 'Harvard', name: 'Harvard', desc: 'Harvard Referencing' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-gray-200 dark:border-gray-700 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-accent p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Cite This Paper</h2>
                <p className="text-sm text-blue-100 mt-0.5">Choose your citation style</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Style Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Citation Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`p-3 rounded-xl font-medium transition-all duration-200 text-left ${
                    style === s.id
                      ? 'bg-navy text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-102'
                  }`}
                >
                  <div className="font-bold text-sm">{s.name}</div>
                  <div className={`text-xs mt-0.5 ${style === s.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Citation Display */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Generated Citation
            </label>
            <div className="relative bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 min-h-[100px]">
              {loading ? (
                <div className="flex items-center justify-center h-[68px]">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy"></div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-900 dark:text-white font-mono pr-12 leading-relaxed">
                    {citation}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
                    title={copied ? 'Copied!' : 'Copy to clipboard'}
                  >
                    {copied ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                </>
              )}
            </div>
            {copied && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-semibold animate-slide-up">
                ✓ Citation copied to clipboard!
              </p>
            )}
          </div>

          {/* Paper Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Paper Title:</p>
            <p className="text-sm text-blue-800 dark:text-blue-200 line-clamp-2">{paper.title}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 transition-all duration-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Citation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitationModal;