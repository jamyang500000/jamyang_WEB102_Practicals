const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { likes, posts, users } = require('../utils/mockData');

// @desc    Get all likes
// @route   GET /api/likes
// @access  Public
exports.getLikes = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = likes.length;

  // Optional filter: likes for a specific post
  let filtered = likes;
  if (req.query.post_id) {
    filtered = likes.filter(l => l.post_id === req.query.post_id);
  }

  // Get paginated results
  const results = filtered.slice(startIndex, endIndex);

  // Enhance likes with user data
  const enhancedResults = results.map(like => {
    const user = users.find(user => user.id === like.user_id);
    return {
      ...like,
      user: user ? {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        profile_picture: user.profile_picture
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

// @desc    Get single like
// @route   GET /api/likes/:id
// @access  Public
exports.getLike = asyncHandler(async (req, res, next) => {
  const like = likes.find(l => l.id === req.params.id);

  if (!like) {
    return next(
      new ErrorResponse(`Like not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: like
  });
});

// @desc    Create new like (like a post)
// @route   POST /api/likes
// @access  Private (simulated)
exports.createLike = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const user = users.find(user => user.id === userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Validate post exists
  const post = posts.find(p => p.id === req.body.post_id);
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Check if user already liked this post (no duplicate likes)
  const existingLike = likes.find(
    l => l.user_id === userId && l.post_id === req.body.post_id
  );
  if (existingLike) {
    return next(new ErrorResponse('You already liked this post', 400));
  }

  const newLike = {
    id: (likes.length + 1).toString(),
    user_id: userId,
    post_id: req.body.post_id,
    created_at: new Date().toISOString().slice(0, 10)
  };

  likes.push(newLike);

  res.status(201).json({
    success: true,
    data: newLike
  });
});

// @desc    Update like (rarely used in real apps, but included for CRUD completeness)
// @route   PUT /api/likes/:id
// @access  Private (simulated)
exports.updateLike = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  let like = likes.find(l => l.id === req.params.id);

  if (!like) {
    return next(
      new ErrorResponse(`Like not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user owns the like
  if (like.user_id !== userId) {
    return next(new ErrorResponse('Not authorized to update this like', 401));
  }

  // Update like (only certain fields, IDs stay immutable)
  const index = likes.findIndex(l => l.id === req.params.id);
  likes[index] = {
    ...like,
    ...req.body,
    id: like.id,
    user_id: like.user_id,
    post_id: like.post_id
  };

  res.status(200).json({
    success: true,
    data: likes[index]
  });
});

// @desc    Delete like (unlike a post)
// @route   DELETE /api/likes/:id
// @access  Private (simulated)
exports.deleteLike = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const like = likes.find(l => l.id === req.params.id);

  if (!like) {
    return next(
      new ErrorResponse(`Like not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user owns the like
  if (like.user_id !== userId) {
    return next(new ErrorResponse('Not authorized to delete this like', 401));
  }

  // Delete like
  const index = likes.findIndex(l => l.id === req.params.id);
  likes.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});
