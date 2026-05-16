// Mock data for the Social Media API
// In a real application, this would come from a database

const users = [
  {
    id: '1',
    username: 'traveler',
    email: 'traveler@example.com',
    password: 'hashedpassword123',
    full_name: 'Karma',
    profile_picture: 'https://example.com/profiles/traveler.jpg',
    bio: 'Travel photographer',
    created_at: '2023-01-15'
  },
  {
    id: '2',
    username: 'foodlover',
    email: 'food@example.com',
    password: 'hashedpassword456',
    full_name: 'Sonam',
    profile_picture: 'https://example.com/profiles/foodlover.jpg',
    bio: 'Food enthusiast and home cook',
    created_at: '2023-01-20'
  },
  {
    id: '3',
    username: 'fitnessguru',
    email: 'fitness@example.com',
    password: 'hashedpassword789',
    full_name: 'Tashi',
    profile_picture: 'https://example.com/profiles/fitnessguru.jpg',
    bio: 'Fitness coach and wellness advocate',
    created_at: '2023-02-01'
  }
];

const posts = [
  {
    id: '1',
    user_id: '1',
    caption: 'Beautiful sunset in the mountains! #travel #nature',
    image: 'https://example.com/posts/sunset.jpg',
    created_at: '2023-03-01'
  },
  {
    id: '2',
    user_id: '2',
    caption: 'Homemade pasta from scratch 🍝 #foodie',
    image: 'https://example.com/posts/pasta.jpg',
    created_at: '2023-03-05'
  },
  {
    id: '3',
    user_id: '1',
    caption: 'Hiking adventure today!',
    image: 'https://example.com/posts/hiking.jpg',
    created_at: '2023-03-10'
  },
  {
    id: '4',
    user_id: '3',
    caption: 'Morning workout done! Feeling great 💪',
    image: 'https://example.com/posts/workout.jpg',
    created_at: '2023-03-12'
  }
];

const comments = [
  {
    id: '1',
    post_id: '1',
    user_id: '2',
    text: 'Amazing view!',
    created_at: '2023-03-01'
  },
  {
    id: '2',
    post_id: '1',
    user_id: '3',
    text: 'Where is this?',
    created_at: '2023-03-02'
  },
  {
    id: '3',
    post_id: '2',
    user_id: '1',
    text: 'Looks delicious!',
    created_at: '2023-03-05'
  }
];

const likes = [
  { id: '1', post_id: '1', user_id: '2', created_at: '2023-03-01' },
  { id: '2', post_id: '1', user_id: '3', created_at: '2023-03-01' },
  { id: '3', post_id: '2', user_id: '1', created_at: '2023-03-05' },
  { id: '4', post_id: '3', user_id: '2', created_at: '2023-03-10' }
];

const followers = [
  { id: '1', follower_id: '2', following_id: '1', created_at: '2023-02-15' },
  { id: '2', follower_id: '3', following_id: '1', created_at: '2023-02-20' },
  { id: '3', follower_id: '1', following_id: '2', created_at: '2023-02-25' }
];

module.exports = {
  users,
  posts,
  comments,
  likes,
  followers
};