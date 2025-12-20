import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X, Upload, AlertCircle, CheckCircle } from 'lucide-react';

const TeamManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ name: '', role: '', order: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/team`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setError('Please select an image file');
    return;
  }

  if (file.size > 10 * 1024 * 1024) { 
    setError('Image must be less than 10MB');
    return;
  }

  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
  setError('');
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.role.trim()) {
      setError('Name and role are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('role', formData.role);
      data.append('order', formData.order);
      if (imageFile) data.append('image', imageFile);

      const url = editMode 
        ? `${import.meta.env.VITE_API_URL}/team/${currentMember._id}`
        : `${import.meta.env.VITE_API_URL}/team`;

      const res = await fetch(url, {
        method: editMode ? 'PATCH' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(`✓ Team member ${editMode ? 'updated' : 'added'} successfully!`);
        setShowModal(false);
        resetForm();
        fetchMembers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Operation failed');
      }
    } catch (error) {
      setError('Connection error');
    }
  };

  const handleEdit = (member) => {
    setCurrentMember(member);
    setFormData({ name: member.name, role: member.role, order: member.order });
    setImagePreview(member.imageUrl);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this team member?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccess('✓ Team member deleted');
        fetchMembers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Delete failed');
      }
    } catch (error) {
      setError('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: '', order: 0 });
    setImageFile(null);
    setImagePreview(null);
    setEditMode(false);
    setCurrentMember(null);
    setError('');
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div></div>;
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded flex items-center gap-2">
          <CheckCircle className="text-green-500" size={20} />
          <p className="text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={28} />
          Team Members ({members.length})
        </h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl hover:bg-navy-800">
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Users size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No team members yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div key={member._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-navy to-accent">
                {member.imageUrl ? (
                  <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-center font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">{member.role}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(member)} className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm flex items-center justify-center gap-1">
                  <Edit2 size={14} />
                  Edit
                </button>
                <button onClick={() => handleDelete(member._id)} className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm flex items-center justify-center gap-1">
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editMode ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="w-32 h-32 mx-auto mb-2 rounded-full overflow-hidden bg-gradient-to-br from-navy to-accent hover:opacity-80 transition">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Upload size={32} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Click to upload photo (Max: 10MB)</p>
                </label>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              <input
                type="text"
                placeholder="Full Name*"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
              />

              <input
                type="text"
                placeholder="Role/Position*"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
              />

              <input
                type="number"
                placeholder="Display Order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
              />

              <button type="submit" className="w-full bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 font-semibold">
                {editMode ? 'Update Member' : 'Add Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;