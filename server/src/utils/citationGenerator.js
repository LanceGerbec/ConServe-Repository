export const generateCitation = (paper, style) => {
  const authors = paper.authors.join(', ');
  const year = new Date(paper.createdAt).getFullYear();
  const title = paper.title;

  switch (style) {
    case 'APA':
      return `${authors} (${year}). ${title}. NEUST College of Nursing Research Repository.`;
    case 'MLA':
      return `${authors}. "${title}." NEUST College of Nursing Research Repository, ${year}.`;
    case 'Chicago':
      return `${authors}. "${title}." NEUST College of Nursing Research Repository (${year}).`;
    case 'Harvard':
      return `${authors}, ${year}. ${title}. NEUST College of Nursing Research Repository.`;
    default:
      return `${authors} (${year}). ${title}. NEUST College of Nursing Research Repository.`;
  }
};