import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const PhotoUploadModal = ({ repairId, onClose, onSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('photos', file));
    formData.append('caption', caption);

    try {
      const res = await api.post(`/repairs/${repairId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Device photos uploaded successfully');
        onSuccess && onSuccess(res.data.photos);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            Upload Device Condition Photos
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Photos (JPEG, PNG, WEBP)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-slate-950 p-2 border border-slate-800 rounded-xl"
            />
            {selectedFiles.length > 0 && (
              <p className="text-xs text-blue-400 mt-2 font-medium">
                {selectedFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Photo Caption / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Cracked back panel, dust accumulation, serial tag"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder-slate-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photos</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
