'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/authContext';
import uploadService from '@/services/uploadService';
import videoService from '@/services/videoService';

export default function UploadPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [audioName, setAudioName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  // Drag-and-drop handlers (matches Practical 3 muscle memory)
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please drop a video file');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-3">Sign in to upload</h1>
        <p className="text-gray-500 mb-6">You need an account to upload videos.</p>
        <Link
          href="/login"
          className="inline-block bg-red-500 text-white py-2 px-6 rounded-md font-medium hover:bg-red-600"
        >
          Log in
        </Link>
      </div>
    );
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Please select a video to upload');
      return;
    }
    if (uploading) return;

    setUploading(true);
    try {
      // 1. Upload video directly from browser to Supabase Storage
      setProgress('Uploading video to cloud…');
      const videoResult = await uploadService.uploadToCloud('videos', videoFile, user?.id);

      // 2. Upload thumbnail if provided
      let thumbnailResult = { publicUrl: null, storagePath: null };
      if (thumbnailFile) {
        setProgress('Uploading thumbnail to cloud…');
        thumbnailResult = await uploadService.uploadToCloud('thumbnails', thumbnailFile, user?.id);
      }

      // 3. Save metadata to our backend database
      setProgress('Saving to database…');
      await videoService.createVideo({
        caption: caption.trim(),
        audioName: audioName.trim() || null,
        videoUrl: videoResult.publicUrl,
        thumbnailUrl: thumbnailResult.publicUrl,
        videoStoragePath: videoResult.storagePath,
        thumbnailStoragePath: thumbnailResult.storagePath,
      });

      toast.success('Video uploaded successfully!');
      router.push('/');
    } catch (err) {
      console.error('Upload failed:', err);
      const msg =
        err.response?.data?.message || err.message || 'Failed to upload video';
      toast.error(msg);
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Upload video</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: video drop zone (supports drag-and-drop OR click) */}
        <div
          className={`lg:w-[360px] border-dashed border-2 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'
          }`}
          onClick={() => videoInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {videoPreview ? (
            <video
              src={videoPreview}
              className="w-full max-h-[400px] rounded-md"
              controls
              muted
            />
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-4xl text-gray-400">+</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Select video to upload</h3>
              <p className="text-sm text-gray-500 mb-4">Drag and drop or click to choose</p>
              <p className="text-xs text-gray-400">MP4, WebM, or MOV</p>
            </>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
          {videoFile && (
            <p className="text-xs text-gray-600 mt-2 truncate w-full">
              {videoFile.name}
            </p>
          )}
        </div>

        {/* Right: details */}
        <div className="flex-1">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:border-red-500"
              placeholder="Describe your video…"
              maxLength={150}
              disabled={uploading}
            />
            <p className="text-xs text-gray-400 mt-1">{caption.length}/150</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Audio name (optional)</label>
            <input
              type="text"
              value={audioName}
              onChange={(e) => setAudioName(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:border-red-500"
              placeholder="Original Sound"
              disabled={uploading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Thumbnail (optional)</label>
            <div
              className="h-32 bg-gray-100 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 overflow-hidden"
              onClick={() => thumbnailInputRef.current?.click()}
            >
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="thumbnail preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-sm">Click to select an image</span>
              )}
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={uploading || !videoFile}
              className="bg-red-500 text-white py-2 px-8 rounded-md font-medium hover:bg-red-600 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Post'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              disabled={uploading}
              className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            {progress && <span className="text-sm text-gray-500">{progress}</span>}
          </div>
        </div>
      </div>
    </form>
  );
}
