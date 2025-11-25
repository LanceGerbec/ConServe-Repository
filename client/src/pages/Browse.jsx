// client/src/pages/Browse.jsx
import ResearchList from '../components/research/ResearchList';

const Browse = () => {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Research Repository
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Browse and discover nursing research papers from NEUST College of Nursing
        </p>
      </div>

      <ResearchList />
    </div>
  );
};

export default Browse;
