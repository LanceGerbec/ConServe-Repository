import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

const CitationModal = ({ paper, onClose }) => {
  const [style, setStyle] = useState('APA');
  const [copied, setCopied] = useState(false);
  const [citation, setCitation] = useState('');

  const generateCitation = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${paper._id}/citation?style=${style}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCitation(data.citation);
    } catch (error) {
      console.error('Citation error:', error);
    }
  };

  useState(() => {
    generateCitation();
  }, [style]);

  useEffect(() => {
  generateCitation();
}, [style]);

  const handleCopy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cite This Paper</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Citation Style
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['APA', 'MLA', 'Chicago', 'Harvard'].map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  style === s
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4 relative">
          <p className="text-gray-900 dark:text-white font-mono text-sm">{citation}</p>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default CitationModal;