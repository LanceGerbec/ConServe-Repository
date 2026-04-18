// client/src/components/research/AuthorLink.jsx
// Drop-in component to render a clickable author name that navigates to their profile
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

// Find user by name (best-effort fuzzy match from paper's submittedBy)
const AuthorLink = ({ authorName, submittedBy, className = '' }) => {
  const navigate = useNavigate();
  const isSubmitter = submittedBy && (
    `${submittedBy.firstName} ${submittedBy.lastName}`.toLowerCase() === authorName?.toLowerCase() ||
    submittedBy.firstName?.toLowerCase() === authorName?.split(' ')[0]?.toLowerCase()
  );

  if (isSubmitter && submittedBy?._id) {
    return (
      <button
        onClick={() => navigate(`/author/${submittedBy._id}`)}
        className={`text-navy dark:text-accent hover:underline font-medium transition-colors ${className}`}
        title={`View ${authorName}'s profile`}
      >
        {authorName}
      </button>
    );
  }

  // Non-submitter author — still try to search
  return (
    <SearchableAuthorLink authorName={authorName} className={className} />
  );
};

const SearchableAuthorLink = ({ authorName, className = '' }) => {
  const navigate = useNavigate();
  const [authorId, setAuthorId] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!authorName) return;
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/author-profiles/search?q=${encodeURIComponent(authorName)}&limit=1`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.authors?.[0]) {
          const a = d.authors[0];
          const full = `${a.firstName} ${a.lastName}`.toLowerCase();
          if (full.includes(authorName.toLowerCase().split(' ')[0]?.toLowerCase())) {
            setAuthorId(a._id);
          }
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [authorName]);

  if (authorId) {
    return (
      <button onClick={() => navigate(`/author/${authorId}`)} className={`text-navy dark:text-accent hover:underline font-medium transition-colors ${className}`} title={`View ${authorName}'s profile`}>
        {authorName}
      </button>
    );
  }
  return <span className={className}>{authorName}</span>;
};

export default AuthorLink;