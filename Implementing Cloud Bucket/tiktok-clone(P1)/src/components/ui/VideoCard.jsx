'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaMusic, FaPlay } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/authContext';
import videoService from '@/services/videoService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
// Strip the /api suffix to get the server root (where /uploads lives)
const SERVER_ROOT = API_BASE.replace(/\/api\/?$/, '');

function buildMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  if (pathOrUrl.startsWith('/')) return `${SERVER_ROOT}${pathOrUrl}`;
  return `${SERVER_ROOT}/${pathOrUrl}`;
}

export default function VideoCard({ video }) {
  const { isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(video?.isLiked || false);
  const [likeCount, setLikeCount] = useState(video?.likeCount || video?._count?.likes || 0);
  const [commentCount, setCommentCount] = useState(video?.commentCount || video?._count?.comments || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!video) return null;

  const username = video.user?.username || 'unknown';
  const fullName = video.user?.name || video.user?.username || '';
  const caption = video.caption || '';
  const userId = video.user?.id;
  const videoUrl = buildMediaUrl(video.videoUrl);
  const thumbnailUrl = buildMediaUrl(video.thumbnailUrl);

  // Toggle video play/pause when clicked
  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle like / unlike
  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like videos');
      return;
    }

    // Optimistic UI update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        await videoService.unlikeVideo(video.id);
      } else {
        await videoService.likeVideo(video.id);
      }
    } catch (err) {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      toast.error('Failed to update like');
    }
  };

  // Toggle comments panel
  const handleCommentClick = async () => {
    const willShow = !showComments;
    setShowComments(willShow);

    if (willShow && comments.length === 0) {
      try {
        const data = await videoService.getVideoComments(video.id);
        // API may return array directly, or wrapped { comments: [...] }
        const list = Array.isArray(data) ? data : data.comments || [];
        setComments(list);
      } catch (err) {
        console.error('Failed to load comments:', err);
        toast.error('Failed to load comments');
      }
    }
  };

  // Submit a new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      toast.error('Please log in to comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const created = await videoService.addComment(video.id, newComment);
      setComments((prev) => [created, ...prev]);
      setCommentCount((prev) => prev + 1);
      setNewComment('');
      toast.success('Comment posted');
    } catch (err) {
      console.error('Failed to post comment:', err);
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="flex py-6 border-b">
      {/* User avatar */}
      <div className="mr-3">
        <Link href={userId ? `/profile/${userId}` : '#'}>
          <div className="h-12 w-12 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center font-bold text-gray-700">
            {video.user?.avatar ? (
              <img src={buildMediaUrl(video.user.avatar)} alt={username} className="h-full w-full object-cover" />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>
        </Link>
      </div>

      <div className="flex-1">
        {/* User info and caption */}
        <div className="mb-2">
          <Link href={userId ? `/profile/${userId}` : '#'}>
            <span className="font-bold hover:underline cursor-pointer">@{username}</span>
          </Link>
          {fullName && <span className="text-sm ml-1 text-gray-600">• {fullName}</span>}
          <p className="text-sm mt-1">{caption}</p>
        </div>

        {/* Audio info */}
        <div className="flex items-center text-sm mb-3 text-gray-600">
          <FaMusic className="mr-2 text-xs" />
          <span className="truncate max-w-[250px]">Original Sound - @{username}</span>
        </div>

        <div className="flex">
          {/* Video container */}
          <div
            className="mr-5 w-[300px] h-[530px] bg-black rounded-md flex items-center justify-center relative overflow-hidden cursor-pointer"
            onClick={handleVideoClick}
          >
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                poster={thumbnailUrl || undefined}
                loop
                playsInline
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <p className="text-white">Video unavailable</p>
            )}

            {/* Play overlay when paused */}
            {!isPlaying && videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/40 rounded-full p-4">
                  <FaPlay className="text-white text-2xl" />
                </div>
              </div>
            )}
          </div>

          {/* Interaction buttons */}
          <div className="flex flex-col justify-end space-y-3 py-2">
            {/* Like */}
            <button className="flex flex-col items-center" onClick={handleLikeClick}>
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              </div>
              <span className="text-xs mt-1">{likeCount}</span>
            </button>

            {/* Comments */}
            <button className="flex flex-col items-center" onClick={handleCommentClick}>
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <FaComment />
              </div>
              <span className="text-xs mt-1">{commentCount}</span>
            </button>

            {/* Share */}
            <button
              className="flex flex-col items-center"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied!');
              }}
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <FaShare />
              </div>
              <span className="text-xs mt-1">Share</span>
            </button>
          </div>
        </div>

        {/* Comments panel */}
        {showComments && (
          <div className="mt-4 max-w-[300px]">
            {isAuthenticated && (
              <form onSubmit={handleSubmitComment} className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  Post
                </button>
              </form>
            )}

            <div className="space-y-2">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-bold">@{c.user?.username || 'unknown'}</span>{' '}
                    <span>{c.content}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}