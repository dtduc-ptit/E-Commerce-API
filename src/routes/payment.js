const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/checkout', auth, paymentController.createCheckoutSession);

module.exports = router;