const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', (req, res) => userController.register(req, res));
router.post('/login', (req, res) => userController.login(req, res));

router.get('/search/users', protect, adminOnly, (req, res) => userController.searchUsers(req, res));

router.get('/:id', protect, (req, res) => userController.getUserById(req, res));
router.put('/:id', protect, (req, res) => userController.updateUser(req, res));
router.patch('/:id/role', protect, adminOnly, (req, res) => userController.updateRole(req, res));
router.patch('/:id/wishlist/add', protect, (req, res) => userController.addToWishlist(req, res));
router.patch('/:id/wishlist/remove', protect, (req, res) => userController.removeFromWishlist(req, res));

router.get('/', protect, adminOnly, (req, res) => userController.getAllUsers(req, res));
router.delete('/:id', protect, adminOnly, (req, res) => userController.deleteUser(req, res));

module.exports = router;