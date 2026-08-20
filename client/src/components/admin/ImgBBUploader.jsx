import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

/**
 * uploadToImgBB — File → ImgBB → returns direct image URL
 */
async function uploadToImgBB(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('ImgBB upload failed');
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'ImgBB upload failed');

  // Return the direct display URL (permanent, CDN-backed)
  return json.data.display_url;
}

/**
 * ImgBBUploader — reusable component for admin product image upload
 *
 * Props:
 *   imageUrls    : string[]          — current list of image URLs
 *   setImageUrls : (urls) => void    — update handler
 *   maxImages    : number            — max allowed images (default 5)
 */
export default function ImgBBUploader({ imageUrls, setImageUrls, maxImages = 5 }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);

  // Handle file selection (multiple files allowed)
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = maxImages - imageUrls.filter(u => u.trim()).length;
    const toUpload = files.slice(0, remaining);

    if (files.length > remaining) {
      toast.error(`Only ${remaining} more image${remaining !== 1 ? 's' : ''} allowed (max ${maxImages})`);
    }

    if (!toUpload.length) return;

    setUploading(true);
    setUploadProgress(toUpload.map(f => ({ name: f.name, status: 'uploading' })));

    const uploadedUrls = [];
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      try {
        // Validate file size (ImgBB max 32MB)
        if (file.size > 32 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 32MB)`);
          setUploadProgress(prev => {
            const next = [...prev];
            next[i] = { ...next[i], status: 'error' };
            return next;
          });
          continue;
        }

        const url = await uploadToImgBB(file);
        uploadedUrls.push(url);
        setUploadProgress(prev => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'done' };
          return next;
        });
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
        setUploadProgress(prev => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'error' };
          return next;
        });
      }
    }

    if (uploadedUrls.length > 0) {
      // Replace empty slots first, then append
      setImageUrls(prev => {
        const existing = [...prev];
        let added = 0;
        for (let i = 0; i < existing.length && added < uploadedUrls.length; i++) {
          if (!existing[i].trim()) {
            existing[i] = uploadedUrls[added++];
          }
        }
        // If still more, append
        while (added < uploadedUrls.length && existing.length < maxImages) {
          existing.push(uploadedUrls[added++]);
        }
        return existing;
      });
      toast.success(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded successfully!`);
    }

    setUploading(false);
    setUploadProgress([]);
    // Reset file input so same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeUrl = (i) => {
    const updated = [...imageUrls];
    updated.splice(i, 1);
    if (updated.length === 0) updated.push('');
    setImageUrls(updated);
  };

  const updateUrl = (i, val) => {
    const updated = [...imageUrls];
    updated[i] = val;
    setImageUrls(updated);
  };

  const addUrlSlot = () => {
    if (imageUrls.length < maxImages) setImageUrls([...imageUrls, '']);
  };

  const canAddMore = imageUrls.filter(u => u.trim()).length < maxImages;

  return (
    <div>
      {/* ── Upload Button ── */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture={undefined}      // allows both camera & gallery on mobile
          className="hidden"
          id="imgbb-file-input"
          onChange={handleFileChange}
          disabled={uploading || !canAddMore}
        />
        <label
          htmlFor="imgbb-file-input"
          className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none
            ${!canAddMore || uploading
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:border-indigo-400'
            }`}
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span className="text-sm font-semibold">Uploading to ImgBB...</span>
            </>
          ) : (
            <>
              <span className="text-xl">📷</span>
              <div className="text-left">
                <p className="text-sm font-bold leading-tight">Take Photo / Choose from Gallery</p>
                <p className="text-[11px] text-indigo-500 leading-tight">Upload directly from phone or computer</p>
              </div>
              {canAddMore && (
                <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                  {imageUrls.filter(u => u.trim()).length}/{maxImages}
                </span>
              )}
            </>
          )}
        </label>

        {/* Upload progress indicators */}
        {uploadProgress.length > 0 && (
          <div className="mt-2 space-y-1">
            {uploadProgress.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {p.status === 'uploading' && <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
                {p.status === 'done' && <span className="text-green-500">✓</span>}
                {p.status === 'error' && <span className="text-red-500">✗</span>}
                <span className={`truncate ${p.status === 'done' ? 'text-green-700' : p.status === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── OR Paste URL ── */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or paste URL from internet</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* ── Image URL Slots ── */}
      <div className="space-y-3">
        {imageUrls.map((url, i) => (
          <div key={i} className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                type="url"
                value={url}
                onChange={(e) => updateUrl(i, e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm pr-8"
                placeholder="https://example.com/image.jpg"
              />
              {url.trim() && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>
              )}
            </div>
            {/* Preview */}
            {url.trim() && (
              <img
                src={url}
                alt="preview"
                className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
                onLoad={(e) => { e.target.style.display = 'block'; }}
              />
            )}
            {imageUrls.length > 1 && (
              <button
                type="button"
                onClick={() => removeUrl(i)}
                className="text-red-400 hover:text-red-600 font-bold flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add slot button */}
      {imageUrls.length < maxImages && (
        <button
          type="button"
          onClick={addUrlSlot}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
        >
          + Add Another Image URL
        </button>
      )}

      {!canAddMore && (
        <p className="mt-2 text-xs text-amber-600 font-medium">✓ Maximum {maxImages} images reached. Remove one to add more.</p>
      )}
    </div>
  );
}
