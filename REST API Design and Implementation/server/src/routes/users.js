const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id/videos', userController.getUserVideos);
router.get('/:id/followers', userController.getUserFollowers);
router.post('/:id/followers', userController.followUser);
router.delete('/:id/followers', userController.unfollowUser);

module.exports = router;