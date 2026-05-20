import api from '@/lib/api-config';

const videoService = {
  // GET /api/videos - get all videos (For You feed)
  getAllVideos: async (cursor = null) => {
    const response = await api.get('/videos', {
      params: {
        cursor,
        limit: 5,
      },
    });

    return response.data;
  },

  // GET /api/videos/following - get videos from followed users
  getFollowingVideos: async (cursor = null) => {
    const response = await api.get('/videos/following', {
      params: {
        cursor,
        limit: 5,
      },
    });

    return response.data;
  },

  // GET /api/videos/:id - get a single video
  getVideo: async (id) => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  // POST /api/videos - upload a new video (legacy: multipart with the file)
  uploadVideo: async (formData) => {
    const response = await api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  // POST /api/videos - create video metadata after a direct-to-Supabase upload (Practical 5)
  // Body: { caption, audioName, videoUrl, thumbnailUrl, videoStoragePath, thumbnailStoragePath }
  createVideo: async (metadata) => {
    const response = await api.post('/videos', metadata);
    return response.data;
  },

  likeVideo: async (id) => {
    const response = await api.post(`/videos/${id}/like`);
    return response.data;
  },

  unlikeVideo: async (id) => {
    const response = await api.delete(`/videos/${id}/like`);
    return response.data;
  },

  getVideoComments: async (id) => {
    const response = await api.get(`/videos/${id}/comments`);
    return response.data;
  },

  addComment: async (id, content) => {
    const response = await api.post(`/videos/${id}/comments`, { content });
    return response.data;
  },
};

export default videoService;