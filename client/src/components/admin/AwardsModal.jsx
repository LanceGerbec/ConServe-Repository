import { useState } from 'react';
import { X, Award, Plus, Trash2, Check } from 'lucide-react';

const AwardsModal = ({ paper, onClose, onSuccess }) => {
  const [awards, setAwards] = useState(paper.awards || []);
  const [newAward, setNewAward] = useState({ name: '', color: 'gold' });
  const [loading, setLoading] = useState(false);

  const colors = [
    { name: 'Gold', value: 'gold', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
    { name: 'Silver', value: 'silver', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
    { name: 'Bronze', value: 'bronze', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' },
    { name: 'Blue', value: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
    { name: 'Green', value: 'green', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
    { name: 'Purple', value: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500' }
  ];

  const getColorClasses = (color) => colors.find(c => c.value === color) || colors[0];

  const addAward = async () => {
    if (!newAward.name.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${paper._id}/awards/add`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newAward)
      });
      if (res.ok) {
        const data = await res.json();
        setAwards(data.awards);
        setNewAward({ name: '', color: 'gold' });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Add award error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeAward = async (awardName) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${paper._id}/awards/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: awardName })
      });
      if (res.ok) {
        const data = await res.json();
        setAwards(data.awards);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Remove award error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-200 dark:border-gray-700 animate-scale-in">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Manage Awards</h3>
                <p className="text-sm text-white/80">{paper.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>🏆 Add Recognition:</strong> Awards will appear as colored badges on this research paper
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Add New Award</label>
            <input
              type="text"
              value={newAward.name}
              onChange={(e) => setNewAward({ ...newAward, name: e.target.value })}
              placeholder="e.g., Best Research Paper 2024"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white mb-3"
              onKeyPress={(e) => e.key === 'Enter' && addAward()}
            />

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Badge Color</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {colors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setNewAward({ ...newAward, color: color.value })}
                    className={`p-3 rounded-lg border-2 transition ${
                      newAward.color === color.value
                        ? `${color.bg} ${color.border} scale-105`
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Award size={20} className={color.text} />
                      <span className="text-xs font-semibold">{color.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {newAward.name && (
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</label>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getColorClasses(newAward.color).bg} ${getColorClasses(newAward.color).text} ${getColorClasses(newAward.color).border} font-bold text-sm`}>
                  <Award size={16} />
                  {newAward.name}
                </div>
              </div>
            )}

            <button
              onClick={addAward}
              disabled={!newAward.name.trim() || loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 font-bold"
            >
              <Plus size={20} />
              Add Award
            </button>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
              <span>Current Awards ({awards.length})</span>
            </h4>
            {awards.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <Award size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No awards yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {awards.map((award, idx) => {
                  const colorClass = getColorClasses(award.color);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600 transition"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 ${colorClass.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Award size={20} className={colorClass.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{award.name}</p>
                          <p className="text-xs text-gray-500">
                            Added {new Date(award.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAward(award.name)}
                        disabled={loading}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition text-red-600 flex-shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AwardsModal;