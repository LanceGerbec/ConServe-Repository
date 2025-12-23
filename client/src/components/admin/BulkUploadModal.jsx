import { useState } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Loader2, File, Trash2 } from 'lucide-react';

const BulkUploadModal = ({ type, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const isStudent = type === 'student';
  const label = isStudent ? 'Student' : 'Faculty';

  // DRAG AND DROP
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

  // FILE SELECTION
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

  // PARSE FILE
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

  // PARSE TEXT INPUT
  const handleTextParse = () => {
    const lines = textInput.split('\n').filter(l => l.trim());
    const parsed = lines.map((line, i) => {
      const [id, name] = line.split(',').map(s => s.trim());
      return { id: id?.toUpperCase(), name, line: i + 1, valid: !!(id && name) };
    }).filter(item => item.id || item.name);
    setPreview(parsed);
  };

  // REMOVE PREVIEW ITEM
  const removePreviewItem = (index) => {
    setPreview(prev => prev.filter((_, i) => i !== index));
  };

  // UPLOAD
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

  // DOWNLOAD TEMPLATE
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-navy to-accent text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Upload size={28} />
              Bulk Upload {label} IDs
            </h2>
            <p className="text-blue-100 text-sm mt-1">Upload multiple IDs at once via file or text</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* MODE SELECTOR */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setUploadMode('file')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition ${
                uploadMode === 'file'
                  ? 'bg-navy text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <File size={18} className="inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setUploadMode('text')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition ${
                uploadMode === 'text'
                  ? 'bg-navy text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FileText size={18} className="inline mr-2" />
              Paste Text
            </button>
          </div>

          {/* ERROR/SUCCESS */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded flex items-start gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-green-700 dark:text-green-400 font-semibold">Upload Complete!</p>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-7">
                <p>✅ Added: <strong>{result.added}</strong></p>
                <p>⏭️ Skipped: <strong>{result.skipped}</strong></p>
                {result.errors.length > 0 && (
                  <p>❌ Errors: <strong>{result.errors.length}</strong></p>
                )}
              </div>
            </div>
          )}

          {/* FILE UPLOAD MODE */}
          {uploadMode === 'file' && (
            <>
              <div className="mb-4">
                <button
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <Download size={20} className="text-navy" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Download Template CSV
                  </span>
                </button>
              </div>

              {/* DRAG DROP ZONE */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-navy bg-navy/5 scale-105'
                    : file
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-navy'
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
                  <div className="flex items-center justify-center gap-4">
                    <FileText className="text-green-600" size={40} />
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={() => { setFile(null); setPreview([]); }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-900 dark:text-white font-semibold mb-2">
                      {dragActive ? 'Drop file here!' : 'Drag & drop your CSV/TXT file'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">or</p>
                    <span className="inline-block bg-navy text-white px-6 py-2 rounded-lg font-semibold hover:bg-navy-800">
                      Browse Files
                    </span>
                    <p className="text-xs text-gray-500 mt-3">Max 5MB • CSV or TXT format</p>
                  </label>
                )}
              </div>
            </>
          )}

          {/* TEXT INPUT MODE */}
          {uploadMode === 'text' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Format:</strong> ID,FullName (one per line)
                </p>
                <code className="block bg-white dark:bg-gray-900 p-2 rounded text-xs font-mono">
                  {isStudent ? '2021-12345,Juan Dela Cruz' : 'FAC-001,Dr. John Doe'}
                </code>
              </div>

              <textarea
                rows={8}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Paste your ${label} IDs here...\nFormat: ID,FullName (one per line)`}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 font-mono text-sm resize-none"
              />

              <button
                onClick={handleTextParse}
                disabled={!textInput.trim()}
                className="w-full bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 transition disabled:opacity-50 font-semibold"
              >
                Parse Text
              </button>
            </div>
          )}

          {/* PREVIEW */}
          {preview.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Preview ({preview.length} entries)
                </h3>
                <div className="flex gap-3 text-sm">
                  <span className="text-green-600 font-semibold">✓ Valid: {validCount}</span>
                  {invalidCount > 0 && (
                    <span className="text-red-600 font-semibold">✗ Invalid: {invalidCount}</span>
                  )}
                </div>
              </div>

              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">#</th>
                      <th className="px-4 py-2 text-left font-semibold">ID</th>
                      <th className="px-4 py-2 text-left font-semibold">Name</th>
                      <th className="px-4 py-2 text-center font-semibold">Status</th>
                      <th className="px-4 py-2 text-center font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {preview.map((item, i) => (
                      <tr
                        key={i}
                        className={`${
                          item.valid ? 'bg-white dark:bg-gray-800' : 'bg-red-50 dark:bg-red-900/10'
                        }`}
                      >
                        <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                        <td className="px-4 py-2 font-mono font-semibold">{item.id || '-'}</td>
                        <td className="px-4 py-2">{item.name || '-'}</td>
                        <td className="px-4 py-2 text-center">
                          {item.valid ? (
                            <CheckCircle className="inline text-green-500" size={16} />
                          ) : (
                            <AlertCircle className="inline text-red-500" size={16} />
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => removePreviewItem(i)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                          >
                            <Trash2 size={14} />
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

        {/* FOOTER */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900 flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || validCount === 0}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload {validCount} {validCount === 1 ? 'Entry' : 'Entries'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;