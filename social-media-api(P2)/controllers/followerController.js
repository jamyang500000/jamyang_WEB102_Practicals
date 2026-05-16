const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { followers, users } = require('../utils/mockData');

// @desc    Get all followers
// @route   GET /followers
// @access  Public
exports.getFollowers = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = followers.length;

  // Optional filter: who follows a specific user
  // ?following_id=1 -> get all followers of user 1
  // ?follower_id=1 -> get all users that user 1 follows
  let filtered = followers;
  if (req.query.following_id) {
    filtered = followers.filter(f => f.following_id === req.query.following_id);
  } else if (req.query.follower_id) {
    filtered = followers.filter(f => f.follower_id === req.query.follower_id);
  }

  // Get paginated results
  const results = filtered.slice(startIndex, endIndex);

  // Enhance with user data (both follower and the user being followed)
  const enhancedResults = results.map(follow => {
    const follower_user = users.find(u => u.id === follow.follower_id);
    const following_user = users.find(u => u.id === follow.following_id);
    return {
      ...follow,
      follower_user: follower_user ? {
        id: follower_user.id,
        username: follower_user.username,
        full_name: follower_user.full_name,
        profile_picture: follower_user.profile_picture
      } : null,
      following_user: following_user ? {
        id: following_user.id,
        username: following_user.username,
        full_name: following_user.full_name,
        profile_picture: following_user.profile_picture
      } : null
    };
  });

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: enhancedResults.length,
    page,
    total_pages: Math.ceil(total / limit),
    pagination,
    data: enhancedResults
  });
});

// @desc    Get single follower record
// @route   GET /followers/:id
// @access  Public
exports.getFollower = asyncHandler(async (req, res, next) => {
  const follow = followers.find(f => f.id === req.params.id);

  if (!follow) {
    return next(
      new ErrorResponse(`Follower record not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: follow
  });
});

// @desc    Create new follower record (follow a user)
// @route   POST /followers
// @access  Private (simulated)
exports.createFollower = asyncHandler(async (req, res, next) => {
  // Simulate authentication (the user doing the following)
  const followerId = req.header('X-User-Id');
  if (!followerId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const followerUser = users.find(u => u.id === followerId);
  if (!followerUser) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Validate user to be followed exists
  const userToFollow = users.find(u => u.id === req.body.following_id);
  if (!userToFollow) {
    return next(new ErrorResponse('User to follow not found', 404));
  }

  // Prevent self-following
  if (followerId === req.body.following_id) {
    return next(new ErrorResponse('You cannot follow yourself', 400));
  }

  // Check if already following
  const existingFollow = followers.find(
    f => f.follower_id === followerId && f.following_id === req.body.following_id
  );
  if (existingFollow) {
    return next(new ErrorResponse('You are already following this user', 400));
  }

  const newFollow = {
    id: (followers.length + 1).toString(),
    follower_id: followerId,            // The user doing the following
    following_id: req.body.following_id, // The user being followed
    created_at: new Date().toISOString().slice(0, 10)
  };

  followers.push(newFollow);

  res.status(201).json({
    success: true,
    data: newFollow
  });
});

// @desc    Update follower record (included for CRUD completeness)
// @route   PUT /followers/:id
// @access  Private (simulated)
exports.updateFollower = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  let follow = followers.find(f => f.id === req.params.id);

  if (!follow) {
    return next(
      new ErrorResponse(`Follower record not found with id of ${req.params.id}`, 404)
    );
  }

  // Only the follower can modify their own follow record
  if (follow.follower_id !== userId) {
    return next(new ErrorResponse('Not authorized to update this record', 401));
  }

  // Update (IDs are immutable)
  const index = followers.findIndex(f => f.id === req.params.id);
  followers[index] = {
    ...follow,
    ...req.body,
    id: follow.id,
    follower_id: follow.follower_id,
    following_id: follow.following_id
  };

  res.status(200).json({
    success: true,
    data: followers[index]
  });
});

// @desc    Delete follower (unfollow a user)
// @route   DELETE /followers/:id
// @access  Private (simulated)
exports.deleteFollower = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const follow = followers.find(f => f.id === req.params.id);

  if (!follow) {
    return next(
      new ErrorResponse(`Follower record not found with id of ${req.params.id}`, 404)
    );
  }

  // Only the follower can unfollow
  if (follow.follower_id !== userId) {
    return next(new ErrorResponse('Not authorized to delete this record', 401));
  }

  // Delete (unfollow)
  const index = followers.findIndex(f => f.id === req.params.id);
  followers.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});
