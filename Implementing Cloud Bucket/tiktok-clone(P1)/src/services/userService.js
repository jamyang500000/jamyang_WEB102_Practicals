import api from '@/lib/api-config';

const userService = {
  // GET /api/users - get all users (for "Explore Users")
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // GET /api/users/:id - get a specific user's profile
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // GET /api/users/:id/videos - get videos of a specific user
  getUserVideos: async (id) => {
    const response = await api.get(`/users/${id}/videos`);
    return response.data;
  },

  // GET /api/users/:id/followers - get followers of a user
  getUserFollowers: async (id) => {
    const response = await api.get(`/users/${id}/followers`);
    return response.data;
  },

  // GET /api/users/:id/following - get who a user is following
  getUserFollowing: async (id) => {
    const response = await api.get(`/users/${id}/following`);
    return response.data;
  },

  // POST /api/users/:id/follow - follow a user
  followUser: async (id) => {
    const response = await api.post(`/users/${id}/follow`);
    return response.data;
  },

  // DELETE /api/users/:id/follow - unfollow a user
  unfollowUser: async (id) => {
    const response = await api.delete(`/users/${id}/follow`);
    return response.data;
  },

  // PUT /api/users/:id - update user profile
  updateUser: async (id, formData) => {
    const response = await api.put(`/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default userService;