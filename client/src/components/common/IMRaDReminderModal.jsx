import { useState } from 'react';
import { X, ChevronDown, ChevronUp, FileText, Check, AlertTriangle } from 'lucide-react';

const FORMAT = [
  'Times New Roman, Font 12',
  'Single Spacing, Justified alignment',
  'Margin: 1" all sides',
  'Main Headings: Capitalized, bold, left-justified, double-spaced above/below — no colon at end',
  'Subheadings: Capitalized, bold italics OR underlined',
  'In-text citation: Author-date system',
  'Pagination: Bottom of page, right side',
  'Recommended: 5 Tables, 5 Figures',
  'Recommended length: 15–25 pages (excluding appendices)',
];

const SECTIONS = [
  ['Title', 'Centered, capital letters, bold, 8–15 words'],
  ['Author/s', 'Listed based on contribution'],
  ['Abstract', '250–300 words'],
  ['Keywords', 'Not more than 5, italicized'],
  ['Introduction', '1,500–3,000 words'],
  ['Materials & Method / Methodology', '500–1,000 words'],
  ['Results and Discussion', '1,500–3,000 words'],
  ['Conclusion & Recommendations', '250–500 words'],
  ['References', 'APA format/style'],
];

const IMRaDReminderModal = ({ isOpen, onClose, onConfirm }) => {
  const [formatOpen, setFormatOpen] = useState(true);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border-2 border-navy/20 dark:border-blue-600/30 animate-scale-in">

        <div className="bg-gradient-to-r from-navy to-accent text-white p-5 rounded-t-2xl flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={20} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg leading-tight">IMRaD Format Reminder</h2>
            <p className="text-blue-100 text-xs">Confirm your paper meets these requirements</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        <div className="mx-5 mt-4 flex-shrink-0 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded-lg flex items-start gap-2">
          <AlertTriangle size={15} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            Papers not following IMRaD format may be <strong>rejected</strong>. Review all requirements before submitting.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setFormatOpen(!formatOpen)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
            >
              <span className="font-bold text-sm text-gray-900 dark:text-white">📄 Format Requirements</span>
              {formatOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>
            {formatOpen && (
              <ul className="p-3 space-y-1.5">
                {FORMAT.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy dark:bg-accent mt-1.5 flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setSectionsOpen(!sectionsOpen)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
            >
              <span className="font-bold text-sm text-gray-900 dark:text-white">📑 Required Sections</span>
              {sectionsOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>
            {sectionsOpen && (
              <div className="p-3 space-y-2">
                {SECTIONS.map(([name, desc], i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="font-bold text-navy dark:text-accent min-w-[140px] flex-shrink-0">{name}</span>
                    <span className="text-gray-600 dark:text-gray-400">{desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Need more details?{' '}
            <a href="/help#imrad" target="_blank" rel="noreferrer" className="text-navy dark:text-accent hover:underline font-semibold">
              View full guide in Help
            </a>
          </p>
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-gray-700 space-y-3 flex-shrink-0">
          <label className="flex items-start gap-3 cursor-pointer bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded accent-navy flex-shrink-0"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              I confirm my paper follows IMRaD format requirements and is ready for submission.
            </span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => { if (agreed) { onConfirm(); setAgreed(false); } }}
              disabled={!agreed}
              className="flex-1 px-4 py-2.5 bg-navy dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 dark:hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={16} />
              I Agree, Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IMRaDReminderModal;