'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/authContext';
import userService from '@/services/userService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SERVER_ROOT = API_BASE.replace(/\/api\/?$/, '');

function buildAvatarUrl(p) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/')) return `${SERVER_ROOT}${p}`;
  return `${SERVER_ROOT}/${p}`;
}

export default function ExploreUsersPage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [allUsers, myFollowing] = await Promise.all([
          userService.getAllUsers(),
          currentUser?.id ? userService.getUserFollowing(currentUser.id) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setUsers(Array.isArray(allUsers) ? allUsers : []);
        setFollowingIds(new Set((myFollowing || []).map((u) => u.id)));
      } catch (err) {
        console.error('Failed to load users:', err);
        toast.error('Failed to load users');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  const handleToggleFollow = async (userId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow users');
      return;
    }
    if (busyUserId === userId) return;
    setBusyUserId(userId);

    const isFollowing = followingIds.has(userId);
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(userId);
      else next.add(userId);
      return next;
    });

    try {
      if (isFollowing) {
        await userService.unfollowUser(userId);
        toast.success('Unfollowed');
      } else {
        await userService.followUser(userId);
        toast.success('Followed');
      }
    } catch (err) {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.add(userId);
        else next.delete(userId);
        return next;
      });
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyUserId(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading users…</div>;
  }

  const term = search.trim().toLowerCase();
  const visibleUsers = users
    .filter((u) => u.id !== currentUser?.id)
    .filter(
      (u) =>
        !term ||
        u.username?.toLowerCase().includes(term) ||
        u.name?.toLowerCase().includes(term)
    );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Explore Users</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by username or name…"
        className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:border-red-500"
      />

      {visibleUsers.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          {term ? 'No users match your search.' : 'No other users yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          {visibleUsers.map((u) => {
            const isFollowing = followingIds.has(u.id);
            const avatar = buildAvatarUrl(u.avatar);
            return (
              <div
                key={u.id}
                className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50"
              >
                <Link href={`/profile/${u.id}`} className="flex items-center gap-3 flex-1">
                  <div className="h-12 w-12 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center font-bold text-gray-700">
                    {avatar ? (
                      <img src={avatar} alt={u.username} className="h-full w-full object-cover" />
                    ) : (
                      (u.username || '?').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">@{u.username}</p>
                    {u.name && <p className="text-sm text-gray-600">{u.name}</p>}
                    {u._count && (
                      <p className="text-xs text-gray-500 mt-1">
                        {u._count.followedBy ?? 0} followers · {u._count.videos ?? 0} videos
                      </p>
                    )}
                  </div>
                </Link>

                {isAuthenticated && (
                  <button
                    onClick={() => handleToggleFollow(u.id)}
                    disabled={busyUserId === u.id}
                    className={
                      isFollowing
                        ? 'border border-gray-300 text-gray-700 py-1.5 px-4 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50'
                        : 'bg-red-500 text-white py-1.5 px-4 rounded-md text-sm font-medium hover:bg-red-600 disabled:opacity-50'
                    }
                  >
                    {busyUserId === u.id ? '…' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
