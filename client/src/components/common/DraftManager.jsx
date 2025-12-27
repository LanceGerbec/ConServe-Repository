import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

const DraftManager = ({ draftKey, data, onRestore }) => {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      setHasDraft(true);
      const parsed = JSON.parse(saved);
      setLastSaved(new Date(parsed.timestamp));
    }
  }, [draftKey]);

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      const draft = { data, timestamp: Date.now() };
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setLastSaved(new Date());
    }
  }, [data, draftKey]);

  const restoreDraft = () => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      onRestore(parsed.data);
      setHasDraft(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
    setHasDraft(false);
  };

  if (!hasDraft) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg mb-4 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">📝 Draft Found</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Last saved: {lastSaved?.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={restoreDraft}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
          >
            Restore
          </button>
          <button
            onClick={clearDraft}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-semibold"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftManager;