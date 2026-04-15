const userRepository = require('../repositories/UserRepository');
const productRepository = require('../repositories/ProductRepository');
const orderRepository = require('../repositories/OrderRepository');
const reviewRepository = require('../repositories/ReviewRepository');

const userService = require('../services/UserService');
const productService = require('../services/ProductService');
const orderService = require('../services/OrderService');
const reviewService = require('../services/ReviewService');

const userController = require('../controllers/UserController');
const productController = require('../controllers/ProductController');
const orderController = require('../controllers/OrderController');
const reviewController = require('../controllers/ReviewController');

const container = {
    userRepository,
    productRepository,
    orderRepository,
    reviewRepository,

    userService,
    productService,
    orderService,
    reviewService,

    userController,
    productController,
    orderController,
    reviewController,
};

module.exports = container;