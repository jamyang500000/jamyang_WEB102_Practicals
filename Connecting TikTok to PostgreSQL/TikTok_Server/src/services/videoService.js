import api from '@/lib/api-config';

const videoService = {
  // GET /api/videos - get all videos (For You feed)
  getAllVideos: async () => {
    const response = await api.get('/videos');
    return response.data;
  },

  // GET /api/videos/following - get videos from followed users (auth required)
  getFollowingVideos: async () => {
    const response = await api.get('/videos/following');
    return response.data;
  },

  // GET /api/videos/:id - get a single video
  getVideo: async (id) => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  // POST /api/videos - upload a new video (multipart/form-data)
  uploadVideo: async (formData) => {
    const response = await api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // POST /api/videos/:id/like - like a video
  likeVideo: async (id) => {
    const response = await api.post(`/videos/${id}/like`);
    return response.data;
  },

  // DELETE /api/videos/:id/like - unlike a video
  unlikeVideo: async (id) => {
    const response = await api.delete(`/videos/${id}/like`);
    return response.data;
  },

  // GET /api/videos/:id/comments - get comments for a video
  getVideoComments: async (id) => {
    const response = await api.get(`/videos/${id}/comments`);
    return response.data;
  },

  // POST /api/comments - add a comment to a video
  // Backend expects { videoId, text } in body
  addComment: async (videoId, text) => {
    const response = await api.post('/comments', { videoId, text });
    return response.data;
  },
};

export default videoService;