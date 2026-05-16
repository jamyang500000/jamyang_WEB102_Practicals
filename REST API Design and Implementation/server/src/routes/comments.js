const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/', commentController.getAllComments);
router.post('/', commentController.createComment);
router.get('/:id', commentController.getCommentById);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);
router.get('/:id/likes', commentController.getCommentLikes);
router.post('/:id/likes', commentController.likeComment);
router.delete('/:id/likes', commentController.unlikeComment);

module.exports = router;