const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

router.get('/', videoController.getAllVideos);
router.post('/', videoController.createVideo);
router.get('/:id', videoController.getVideoById);
router.put('/:id', videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);
router.get('/:id/comments', videoController.getVideoComments);
router.get('/:id/likes', videoController.getVideoLikes);
router.post('/:id/likes', videoController.likeVideo);
router.delete('/:id/likes', videoController.unlikeVideo);

module.exports = router;