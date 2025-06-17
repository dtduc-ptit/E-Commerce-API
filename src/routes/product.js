const express = require('express');
const router = express.Router();

const isAdmin = require('../middleware/isAdmin');
const auth = require('../middleware/auth');

const productController = require('../controllers/productController');

router.get('/', auth, productController.getProducts);
router.get('/:id', auth, productController.getProductById);

router.post('/', auth, isAdmin, productController.createProduct);
router.patch('/:id', auth, isAdmin, productController.updateProduct);
router.delete('/:id', auth, isAdmin, productController.deleteProduct);

module.exports = router;