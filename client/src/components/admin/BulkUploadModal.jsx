// client/src/components/admin/BulkUploadModal.jsx
import { useState } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Loader2, File, Trash2 } from 'lucide-react';

const BulkUploadModal = ({ type, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [uploadMode, setUploadMode] = useState('file');
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const isStudent = type === 'student';
  const label = isStudent ? 'Student' : 'Faculty';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    
    const validTypes = ['.csv', '.txt', 'text/csv', 'text/plain', 'application/vnd.ms-excel'];
    const isValid = validTypes.some(t => 
      selectedFile.type === t || selectedFile.name.toLowerCase().endsWith('.csv') || selectedFile.name.toLowerCase().endsWith('.txt')
    );

    if (!isValid) {
      setError('Only CSV or TXT files allowed');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    parseFile(selectedFile);
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      const parsed = lines.slice(1).map((line, i) => {
        const [id, name] = line.split(',').map(s => s.trim());
        return { id: id?.toUpperCase(), name, line: i + 2, valid: !!(id && name) };
      }).filter(item => item.id || item.name);
      setPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleTextParse = () => {
    const lines = textInput.split('\n').filter(l => l.trim());
    const parsed = lines.map((line, i) => {
      const [id, name] = line.split(',').map(s => s.trim());
      return { id: id?.toUpperCase(), name, line: i + 1, valid: !!(id && name) };
    }).filter(item => item.id || item.name);
    setPreview(parsed);
  };

  const removePreviewItem = (index) => {
    setPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const validData = preview.filter(item => item.valid);
    
    if (validData.length === 0) {
      setError('No valid entries to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const ids = validData.map(item => 
        isStudent 
          ? { studentId: item.id, fullName: item.name }
          : { facultyId: item.id, fullName: item.name }
      );

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/bulk-upload/${isStudent ? 'students' : 'faculty'}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids })
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResult(data.results);
        setTimeout(() => {
          onSuccess?.();
          if (data.results.errors.length === 0) onClose();
        }, 3000);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = isStudent 
      ? 'STUDENT_ID,FULL_NAME\n2021-12345,Juan Dela Cruz\n2021-67890,Maria Santos\n2022-11111,Pedro Reyes'
      : 'FACULTY_ID,FULL_NAME\nFAC-001,Dr. John Doe\nFAC-002,Prof. Jane Smith\nFAC-003,Dr. Maria Garcia';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_id_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = preview.filter(item => item.valid).length;
  const invalidCount = preview.length - validCount;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl" style={{ maxHeight: '85vh' }}>
        {/* HEADER - FIXED */}
        <div className="bg-gradient-to-r from-navy to-accent text-white p-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Upload size={24} />
              Bulk Upload {label} IDs
            </h2>
            <p className="text-blue-100 text-xs mt-1">Upload multiple IDs at once</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* MODE SELECTOR */}
          <div className="flex gap-2">
            <button
              onClick={() => setUploadMode('file')}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition ${
                uploadMode === 'file'
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <File size={16} className="inline mr-1" />
              File
            </button>
            <button
              onClick={() => setUploadMode('text')}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition ${
                uploadMode === 'text'
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FileText size={16} className="inline mr-1" />
              Text
            </button>
          </div>

          {/* ERROR/SUCCESS */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded flex items-start gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
                <p className="text-green-700 dark:text-green-400 font-semibold text-sm">Upload Complete!</p>
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300 ml-6 space-y-0.5">
                <p>✅ Added: <strong>{result.added}</strong></p>
                <p>⏭️ Skipped: <strong>{result.skipped}</strong></p>
                {result.errors.length > 0 && <p>❌ Errors: <strong>{result.errors.length}</strong></p>}
              </div>
            </div>
          )}

          {/* FILE MODE */}
          {uploadMode === 'file' && (
            <>
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
              >
                <Download size={18} className="text-navy" />
                <span className="font-semibold">Download Template</span>
              </button>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  dragActive ? 'border-navy bg-navy/5' : file ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />

                {file ? (
                  <div className="flex items-center gap-3">
                    <FileText className="text-green-600 flex-shrink-0" size={32} />
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={() => { setFile(null); setPreview([]); }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload className="mx-auto text-gray-400 mb-2" size={36} />
                    <p className="text-sm font-semibold mb-1">{dragActive ? 'Drop here!' : 'Drag & drop CSV/TXT'}</p>
                    <p className="text-xs text-gray-500 mb-2">or</p>
                    <span className="inline-block bg-navy text-white px-4 py-1.5 rounded-lg text-sm font-semibold">
                      Browse
                    </span>
                    <p className="text-xs text-gray-500 mt-2">Max 5MB</p>
                  </label>
                )}
              </div>
            </>
          )}

          {/* TEXT MODE */}
          {uploadMode === 'text' && (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded text-xs">
                <p className="font-semibold mb-1">Format: ID,FullName</p>
                <code className="block bg-white dark:bg-gray-900 p-2 rounded font-mono">
                  {isStudent ? '2021-12345,Juan Dela Cruz' : 'FAC-001,Dr. John Doe'}
                </code>
              </div>

              <textarea
                rows={6}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Paste ${label} IDs here...\nFormat: ID,FullName`}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 font-mono text-xs resize-none"
              />

              <button
                onClick={handleTextParse}
                disabled={!textInput.trim()}
                className="w-full bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition disabled:opacity-50 text-sm font-semibold"
              >
                Parse Text
              </button>
            </>
          )}

          {/* PREVIEW */}
          {preview.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">Preview ({preview.length})</h3>
                <div className="flex gap-2 text-xs">
                  <span className="text-green-600 font-semibold">✓ {validCount}</span>
                  {invalidCount > 0 && <span className="text-red-600 font-semibold">✗ {invalidCount}</span>}
                </div>
              </div>

              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold">#</th>
                      <th className="px-2 py-1.5 text-left font-semibold">ID</th>
                      <th className="px-2 py-1.5 text-left font-semibold">Name</th>
                      <th className="px-2 py-1.5 text-center font-semibold w-16">Status</th>
                      <th className="px-2 py-1.5 text-center font-semibold w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {preview.map((item, i) => (
                      <tr key={i} className={item.valid ? 'bg-white dark:bg-gray-800' : 'bg-red-50 dark:bg-red-900/10'}>
                        <td className="px-2 py-1.5 text-gray-500">{i + 1}</td>
                        <td className="px-2 py-1.5 font-mono font-semibold">{item.id || '-'}</td>
                        <td className="px-2 py-1.5">{item.name || '-'}</td>
                        <td className="px-2 py-1.5 text-center">
                          {item.valid ? (
                            <CheckCircle className="inline text-green-500" size={14} />
                          ) : (
                            <AlertCircle className="inline text-red-500" size={14} />
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            onClick={() => removePreviewItem(i)}
                            className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER - FIXED */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 flex gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || validCount === 0}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload {validCount}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;