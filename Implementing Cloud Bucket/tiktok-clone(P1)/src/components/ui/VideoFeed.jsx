'use client';
import { useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import VideoCard from './VideoCard';
import videoService from '@/services/videoService';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

export default function VideoFeed({ feedType = 'forYou' }) {
  const fetchVideos = async ({ pageParam = null }) => {
    const data =
      feedType === 'following'
        ? await videoService.getFollowingVideos(pageParam)
        : await videoService.getAllVideos(pageParam);
    return data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['videos', feedType],
    queryFn: fetchVideos,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const bottomRef = useIntersectionObserver(handleLoadMore, { threshold: 0.1 });

  if (isLoading) {
    return (
      <div className="max-w-[550px] mx-auto py-10 text-center">
        <p className="text-gray-500">Loading videos…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-[550px] mx-auto py-10 text-center">
        <p className="text-red-500">Error: {error?.response?.data?.message || error?.message || 'Failed to load videos'}</p>
      </div>
    );
  }

  const videos = data?.pages?.flatMap((page) => page.videos ?? []) ?? [];

  if (videos.length === 0) {
    return (
      <div className="max-w-[550px] mx-auto py-10 text-center">
        <p className="text-gray-500 mb-2">No videos found.</p>
        {feedType === 'following' ? (
          <p className="text-sm text-gray-400">Follow some users to see their videos here.</p>
        ) : (
          <p className="text-sm text-gray-400">Be the first to upload a video!</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[550px] mx-auto">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}

      {/* Sentinel element - triggers loading more when visible */}
      <div ref={bottomRef} className="py-4 text-center">
        {isFetchingNextPage && <p className="text-gray-500">Loading more...</p>}
        {!hasNextPage && videos.length > 0 && (
          <p className="text-gray-400 text-sm">You've reached the end!</p>
        )}
      </div>
    </div>
  );
}