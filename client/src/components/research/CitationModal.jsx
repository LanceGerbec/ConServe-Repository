// client/src/components/research/CitationModal.jsx
import { useState } from 'react';
import { X, Copy, Check, Quote } from 'lucide-react';

const STYLES = ['APA', 'MLA', 'Chicago', 'Harvard'];

const generateCitation = (paper, style) => {
  const authors = (paper.authors || []).join(', ');
  const year = paper.yearCompleted || new Date(paper.createdAt).getFullYear();
  const title = paper.title;
  const repo = 'NEUST College of Nursing Research Repository';
  switch (style) {
    case 'APA':     return `${authors} (${year}). ${title}. ${repo}.`;
    case 'MLA':     return `${authors}. "${title}." ${repo}, ${year}.`;
    case 'Chicago': return `${authors}. "${title}." ${repo} (${year}).`;
    case 'Harvard': return `${authors}, ${year}. ${title}. ${repo}.`;
    default:        return `${authors} (${year}). ${title}. ${repo}.`;
  }
};

// onCopied: optional callback to track citation
const CitationModal = ({ paper, onClose, onCopied }) => {
  const [activeStyle, setActiveStyle] = useState('APA');
  const [copied, setCopied] = useState(false);
  const citation = generateCitation(paper, activeStyle);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // ── Notify parent to increment citation counter ──
      if (onCopied) onCopied(activeStyle);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = citation;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopied) onCopied(activeStyle);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <Quote size={18} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Cite this Paper</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Style selector */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Citation Style</p>
            <div className="flex gap-2">
              {STYLES.map(s => (
                <button key={s} onClick={() => setActiveStyle(s)}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                    activeStyle === s
                      ? 'bg-navy dark:bg-blue-600 text-white border-navy dark:border-blue-600 shadow-md'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-navy/40'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Citation text */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-mono">{citation}</p>
          </div>

          {/* Copy button */}
          <button onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              copied
                ? 'bg-green-500 text-white shadow-md shadow-green-200'
                : 'bg-navy dark:bg-blue-600 hover:bg-navy-800 dark:hover:bg-blue-700 text-white shadow-md'
            }`}>
            {copied ? <><Check size={16} /> Copied to clipboard!</> : <><Copy size={16} /> Copy Citation</>}
          </button>
          {copied && (
            <p className="text-center text-xs text-green-600 dark:text-green-400 font-semibold -mt-2">
              Citation count updated
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitationModal;