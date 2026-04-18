// client/src/pages/AuthorSearch.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, BookOpen, Eye, Quote, User, GraduationCap, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const API_URL = import.meta.env.VITE_API_URL;

const AuthorCard = ({ author, onClick }) => {
  const initials = `${author.firstName?.[0] || ''}${author.lastName?.[0] || ''}`.toUpperCase();
  const roleColors = { faculty: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', student: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
  return (
    <div onClick={() => onClick(author._id)} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
          {author.avatar
            ? <img src={author.avatar} alt={author.firstName} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center"><span className="text-white font-black text-sm">{initials}</span></div>}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-navy dark:group-hover:text-accent transition-colors truncate">{author.firstName} {author.lastName}</h3>
          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${roleColors[author.role] || ''}`}>{author.role}</span>
        </div>
      </div>
      {(author.position || author.department) && (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
          <Briefcase size={10} className="flex-shrink-0" /><span className="truncate">{[author.position, author.department].filter(Boolean).join(' · ')}</span>
        </div>
      )}
      {author.institution && (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
          <GraduationCap size={10} className="flex-shrink-0" /><span className="truncate">{author.institution}</span>
        </div>
      )}
      {author.researchInterests && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1 mb-2">{author.researchInterests}</p>
      )}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="flex items-center gap-1 text-xs font-bold text-navy dark:text-accent"><BookOpen size={11} />{author.paperCount}</span>
        <span className="flex items-center gap-1 text-xs text-gray-500"><Eye size={11} />{author.totalViews}</span>
        <span className="flex items-center gap-1 text-xs text-gray-500"><Quote size={11} />{author.totalCitations}</span>
      </div>
    </div>
  );
};

const AuthorSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [authors, setAuthors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const debouncedQ = useDebounce(query, 350);

  const fetchAuthors = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ q: debouncedQ, limit: 18, page: pg, ...(roleFilter && { role: roleFilter }) });
      const res = await fetch(`${API_URL}/author-profiles/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setAuthors(d.authors || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setPage(pg);
      }
    } catch { }
    finally { setLoading(false); }
  }, [debouncedQ, roleFilter]);

  useEffect(() => { fetchAuthors(1); }, [fetchAuthors]);

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy via-blue-700 to-accent rounded-2xl p-6 mb-6 shadow-xl text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Users size={20} /></div>
          <div>
            <h1 className="text-2xl font-black">Researchers</h1>
            <p className="text-blue-100 text-sm">Browse and discover authors in our repository</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, department, interests…"
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-navy dark:focus:border-accent">
            <option value="">All Roles</option>
            <option value="faculty">Faculty</option>
            <option value="student">Students</option>
          </select>
        </div>
        <p className="text-xs text-gray-400 mt-2">{total} researcher{total !== 1 ? 's' : ''} found</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-navy dark:border-accent" />
        </div>
      ) : authors.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <User size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="font-bold text-gray-600 dark:text-gray-400 mb-1">No researchers found</p>
          <p className="text-sm text-gray-400">Try different search terms</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {authors.map(a => <AuthorCard key={a._id} author={a} onClick={id => navigate(`/author/${id}`)} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => fetchAuthors(page - 1)} disabled={page === 1} className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">Page {page} / {totalPages}</span>
              <button onClick={() => fetchAuthors(page + 1)} disabled={page === totalPages} className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuthorSearch;