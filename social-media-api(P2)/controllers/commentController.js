const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { comments, posts, users } = require('../utils/mockData');

// @desc    Get all comments
// @route   GET /comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = comments.length;

  // Optional filter: comments for a specific post
  let filtered = comments;
  if (req.query.post_id) {
    filtered = comments.filter(c => c.post_id === req.query.post_id);
  }

  // Get paginated results
  const results = filtered.slice(startIndex, endIndex);

  // Enhance comments with user data
  const enhancedResults = results.map(comment => {
    const user = users.find(user => user.id === comment.user_id);
    return {
      ...comment,
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

// @desc    Get single comment
// @route   GET /comments/:id
// @access  Public
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = comments.find(c => c.id === req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  // Enhance with user data
  const user = users.find(user => user.id === comment.user_id);
  const enhancedComment = {
    ...comment,
    user: user ? {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      profile_picture: user.profile_picture
    } : null
  };

  res.status(200).json({
    success: true,
    data: enhancedComment
  });
});

// @desc    Create new comment
// @route   POST /comments
// @access  Private (simulated)
exports.createComment = asyncHandler(async (req, res, next) => {
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

  // Validate body has text
  if (!req.body.text) {
    return next(new ErrorResponse('Please provide comment text', 400));
  }

  const newComment = {
    id: (comments.length + 1).toString(),
    post_id: req.body.post_id,
    user_id: userId,
    text: req.body.text,
    created_at: new Date().toISOString().slice(0, 10)
  };

  comments.push(newComment);

  res.status(201).json({
    success: true,
    data: newComment
  });
});

// @desc    Update comment
// @route   PUT /comments/:id
// @access  Private (simulated)
exports.updateComment = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  let comment = comments.find(c => c.id === req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user owns the comment
  if (comment.user_id !== userId) {
    return next(new ErrorResponse('Not authorized to update this comment', 401));
  }

  // Update comment
  const index = comments.findIndex(c => c.id === req.params.id);
  comments[index] = {
    ...comment,
    ...req.body,
    id: comment.id,           // Ensure ID doesn't change
    user_id: comment.user_id, // Ensure user_id doesn't change
    post_id: comment.post_id  // Ensure post_id doesn't change
  };

  res.status(200).json({
    success: true,
    data: comments[index]
  });
});

// @desc    Delete comment
// @route   DELETE /comments/:id
// @access  Private (simulated)
exports.deleteComment = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const comment = comments.find(c => c.id === req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user owns the comment
  if (comment.user_id !== userId) {
    return next(new ErrorResponse('Not authorized to delete this comment', 401));
  }

  // Delete comment
  const index = comments.findIndex(c => c.id === req.params.id);
  comments.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});
