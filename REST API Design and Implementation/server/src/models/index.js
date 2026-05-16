const dataStore = {
  users: [
    { id: 1, username: 'alice', email: 'alice@example.com', name: 'Alice Johnson', followers: [2, 3], following: [2], createdAt: '2025-01-15T10:00:00.000Z' },
    { id: 2, username: 'bob', email: 'bob@example.com', name: 'Bob Smith', followers: [1], following: [1, 3], createdAt: '2025-01-16T11:00:00.000Z' },
    { id: 3, username: 'charlie', email: 'charlie@example.com', name: 'Charlie Brown', followers: [2], following: [1], createdAt: '2025-01-17T12:00:00.000Z' }
  ],
  videos: [
    { id: 1, title: 'Dance Challenge', description: 'Trying the latest dance trend!', url: 'https://example.com/videos/dance.mp4', userId: 1, likes: [2, 3], createdAt: '2025-02-01T10:00:00.000Z' },
    { id: 2, title: 'Cooking Pasta', description: 'Quick 5-minute pasta recipe', url: 'https://example.com/videos/pasta.mp4', userId: 2, likes: [1], createdAt: '2025-02-02T14:30:00.000Z' },
    { id: 3, title: 'Cat Compilation', description: 'Funny cat moments', url: 'https://example.com/videos/cats.mp4', userId: 3, likes: [1, 2], createdAt: '2025-02-03T09:15:00.000Z' }
  ],
  comments: [
    { id: 1, text: 'Awesome moves!', userId: 2, videoId: 1, likes: [1, 3], createdAt: '2025-02-01T11:00:00.000Z' },
    { id: 2, text: 'I need to try this recipe', userId: 1, videoId: 2, likes: [], createdAt: '2025-02-02T15:00:00.000Z' },
    { id: 3, text: 'So cute!', userId: 1, videoId: 3, likes: [2], createdAt: '2025-02-03T10:00:00.000Z' },
    { id: 4, text: 'My cat does the same thing!', userId: 2, videoId: 3, likes: [], createdAt: '2025-02-03T10:30:00.000Z' }
  ],
  nextIds: { users: 4, videos: 4, comments: 5 }
};

module.exports = dataStore;