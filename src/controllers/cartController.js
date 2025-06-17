const Cart = require('../models/Cart');
const mongoose = require('mongoose');

const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const quantity = parseInt(req.body.quantity);
        const userId = req.user.userId;

        if (!productId || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Invalid productId or quantity' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
};

const viewCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Invalid itemId' });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const originalLength = cart.items.length;
        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        if (cart.items.length === originalLength) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        await cart.save();
        res.status(200).json({message: `Item ${itemId} removed from cart`, cart});
    } catch (error) {
        res.status(500).json({ message: 'Error removing from cart', error: error.message });
    }
};

module.exports = {
    addToCart,
    viewCart,
    removeFromCart
};