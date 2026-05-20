'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FaPlay, FaHeart, FaComment } from 'react-icons/fa';
import { useAuth } from '@/contexts/authContext';
import userService from '@/services/userService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SERVER_ROOT = API_BASE.replace(/\/api\/?$/, '');

function buildMediaUrl(p) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/')) return `${SERVER_ROOT}${p}`;
  return `${SERVER_ROOT}/${p}`;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = parseInt(params?.userId);
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (!userId || Number.isNaN(userId)) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [user, userVideos, followers, myFollowing] = await Promise.all([
          userService.getUserById(userId),
          userService.getUserVideos(userId).catch(() => []),
          userService.getUserFollowers(userId).catch(() => []),
          currentUser?.id
            ? userService.getUserFollowing(currentUser.id).catch(() => [])
            : Promise.resolve([]),
        ]);

        if (cancelled) return;

        setProfile(user);
        const list = Array.isArray(userVideos) ? userVideos : userVideos.videos || [];
        setVideos(list);
        setFollowerCount(
          Array.isArray(followers) ? followers.length : user?._count?.followedBy ?? 0
        );
        setIsFollowing((myFollowing || []).some((u) => u.id === userId));
      } catch (err) {
        console.error('Failed to load profile:', err);
        toast.error('Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, currentUser?.id]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow users');
      return;
    }
    if (busy) return;
    setBusy(true);

    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount((prev) => (wasFollowing ? Math.max(0, prev - 1) : prev + 1));

    try {
      if (wasFollowing) {
        await userService.unfollowUser(userId);
      } else {
        await userService.followUser(userId);
      }
    } catch (err) {
      setIsFollowing(wasFollowing);
      setFollowerCount((prev) => (wasFollowing ? prev + 1 : Math.max(0, prev - 1)));
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading profile…</div>;
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">User not found.</p>
        <Link href="/explore-users" className="text-red-500 hover:underline">
          Back to explore
        </Link>
      </div>
    );
  }

  const avatar = buildMediaUrl(profile.avatar);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-6 mb-8 pb-6 border-b">
        <div className="h-24 w-24 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center font-bold text-3xl text-gray-700">
          {avatar ? (
            <img src={avatar} alt={profile.username} className="h-full w-full object-cover" />
          ) : (
            (profile.username || '?').charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">@{profile.username}</h1>
          {profile.name && <p className="text-gray-600">{profile.name}</p>}
          {profile.bio && <p className="text-sm mt-2 text-gray-700">{profile.bio}</p>}

          <div className="flex gap-6 mt-3 text-sm">
            <span>
              <strong>{profile._count?.following ?? 0}</strong>{' '}
              <span className="text-gray-600">Following</span>
            </span>
            <span>
              <strong>{followerCount}</strong>{' '}
              <span className="text-gray-600">Followers</span>
            </span>
            <span>
              <strong>{profile._count?.videos ?? videos.length}</strong>{' '}
              <span className="text-gray-600">Videos</span>
            </span>
          </div>
        </div>

        {!isOwnProfile && isAuthenticated && (
          <button
            onClick={handleToggleFollow}
            disabled={busy}
            className={
              isFollowing
                ? 'border border-gray-300 text-gray-700 py-2 px-6 rounded-md font-medium hover:bg-gray-100 disabled:opacity-50'
                : 'bg-red-500 text-white py-2 px-6 rounded-md font-medium hover:bg-red-600 disabled:opacity-50'
            }
          >
            {busy ? '…' : isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">Videos</h2>
      {videos.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No videos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {videos.map((v) => {
            const thumb = buildMediaUrl(v.thumbnailUrl);
            const vidUrl = buildMediaUrl(v.videoUrl);
            return (
              <div
                key={v.id}
                className="aspect-[9/16] bg-black rounded-md overflow-hidden relative group cursor-pointer"
              >
                {thumb ? (
                  <img src={thumb} alt={v.caption || 'video'} className="w-full h-full object-cover" />
                ) : vidUrl ? (
                  <video src={vidUrl} muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                    No preview
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-end p-2">
                  <div className="flex gap-3 text-white text-xs opacity-0 group-hover:opacity-100 transition">
                    <span className="flex items-center gap-1"><FaPlay /> {v.views ?? 0}</span>
                    <span className="flex items-center gap-1"><FaHeart /> {v.likeCount ?? v._count?.likes ?? 0}</span>
                    <span className="flex items-center gap-1"><FaComment /> {v.commentCount ?? v._count?.comments ?? 0}</span>
                  </div>
                </div>
                {v.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-xs truncate">
                    {v.caption}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
