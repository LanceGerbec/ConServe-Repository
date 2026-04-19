// client/src/components/research/CoAuthorInput.jsx
// Drop-in replacement for the authors input in SubmitResearch.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, User, Users, Search, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const useDebounce = (value, delay) => {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
};

const CoAuthorInput = ({ value = [], onChange, label = 'Authors', placeholder = 'Type a name…', className = '' }) => {
  const [inputVal, setInputVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQ = useDebounce(inputVal, 300);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) { setSuggestions([]); setShowDrop(false); return; }
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/author-profiles/suggest-coauthors?q=${encodeURIComponent(debouncedQ)}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { suggestions: [] })
      .then(d => { setSuggestions(d.suggestions || []); setShowDrop((d.suggestions || []).length > 0); })
      .catch(() => { setSuggestions([]); setShowDrop(false); })
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  const addAuthor = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) onChange([...value, trimmed]);
    setInputVal('');
    setSuggestions([]);
    setShowDrop(false);
    inputRef.current?.focus();
  }, [value, onChange]);

  const removeAuthor = (idx) => onChange(value.filter((_, i) => i !== idx));

  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
      e.preventDefault();
      addAuthor(inputVal);
    }
    if (e.key === 'Backspace' && !inputVal && value.length) removeAuthor(value.length - 1);
  };

  const SuggestionIcon = ({ item }) => {
    if (item.type === 'user') {
      if (item.avatar) return <img src={item.avatar} alt={item.name} className="w-7 h-7 rounded-lg object-cover" />;
      const initials = item.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      return <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-navy to-accent flex items-center justify-center flex-shrink-0"><span className="text-white text-[10px] font-black">{initials}</span></div>;
    }
    return <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"><User size={14} className="text-gray-400" /></div>;
  };

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <div
        className="min-h-[44px] flex flex-wrap gap-1.5 p-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus-within:border-navy dark:focus-within:border-accent bg-white dark:bg-gray-700 cursor-text transition"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((author, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy/10 dark:bg-accent/20 text-navy dark:text-accent rounded-lg text-xs font-semibold border border-navy/20 dark:border-accent/30 max-w-[180px]">
            <span className="truncate">{author}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); removeAuthor(i); }} className="hover:text-red-500 transition flex-shrink-0 ml-0.5">
              <X size={11} />
            </button>
          </span>
        ))}
        <div className="relative flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => suggestions.length && setShowDrop(true)}
            placeholder={value.length === 0 ? placeholder : 'Add another…'}
            className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder-gray-400 py-0.5"
          />
          {loading && <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-navy border-t-transparent rounded-full animate-spin" />}
        </div>
      </div>

      {showDrop && (
        <div ref={dropRef} className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button key={i} type="button" onMouseDown={(e) => { e.preventDefault(); addAuthor(s.name); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left border-b border-gray-100 dark:border-gray-700 last:border-0">
              <SuggestionIcon item={s} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {s.type === 'user' ? `${s.role || ''} ${s.department ? `· ${s.department}` : ''}`.trim() : `Co-author · ${s.paperCount || 0} paper${s.paperCount !== 1 ? 's' : ''}`}
                </p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${s.type === 'user' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                {s.type === 'user' ? 'Account' : 'External'}
              </span>
            </button>
          ))}
          {inputVal.trim() && (
            <button type="button" onMouseDown={(e) => { e.preventDefault(); addAuthor(inputVal); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left bg-navy/5 dark:bg-accent/10">
              <div className="w-7 h-7 rounded-lg bg-navy/20 dark:bg-accent/20 flex items-center justify-center flex-shrink-0"><X size={12} className="rotate-45 text-navy dark:text-accent" /></div>
              <div>
                <p className="text-sm font-semibold text-navy dark:text-accent">Add "{inputVal.trim()}"</p>
                <p className="text-xs text-gray-500">as external co-author</p>
              </div>
            </button>
          )}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add · Type to search existing users</p>
    </div>
  );
};

export default CoAuthorInput;