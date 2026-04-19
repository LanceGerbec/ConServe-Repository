// client/src/components/research/AuthorLink.jsx
import { useNavigate } from 'react-router-dom';

const resolveLink = (name, coAuthorLinks, submittedBy) => {
  if (!name) return null;
  const norm = name.toLowerCase().trim();
  if (submittedBy) {
    const sName = `${submittedBy.firstName || ''} ${submittedBy.lastName || ''}`.toLowerCase().trim();
    if (sName === norm) return { type: 'user', id: submittedBy._id || submittedBy };
  }
  if (coAuthorLinks?.length) {
    const match = coAuthorLinks.find(l => l.name?.toLowerCase().trim() === norm);
    if (match) {
      if (match.userId) return { type: 'user', id: match.userId._id || match.userId };
      if (match.ghostId) return { type: 'ghost', id: match.ghostId._id || match.ghostId };
    }
  }
  return null;
};

const AuthorLink = ({ authorName, submittedBy, coAuthorLinks, className = '' }) => {
  const navigate = useNavigate();
  const link = resolveLink(authorName, coAuthorLinks, submittedBy);
  if (!link) return <span className={`text-gray-700 dark:text-gray-300 ${className}`}>{authorName}</span>;
  const handleClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    navigate(link.type === 'user' ? `/author/${link.id}` : `/ghost-author/${link.id}`);
  };
  return (
    <button onClick={handleClick} className={`text-navy dark:text-accent hover:underline font-medium transition-colors ${className}`} title={`View ${authorName}'s profile`}>
      {authorName}
    </button>
  );
};

export default AuthorLink;