import Order from '../models/order.js';
import Cart from '../models/cart.js';
import Product from '../models/product.js';
import asyncHandler from 'express-async-handler';

export const checkout = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { cartId } = req.params;

    const cart = await Cart.findOne({ _id: cartId, userId }).populate('products.productId', 'name price stock');
    if (!cart || cart.products.length === 0) {
        return res.status(404).send({ message: 'Cart is empty or not found' });
    }

    const products = cart.products.map(p => ({
        productId: p.productId._id,
        name: p.productId.name,
        quantity: p.quantity,
        price: p.productId.price,
    }));

    const totalAmount = products.reduce((total, p) => total + p.price * p.quantity, 0);

    for (const p of cart.products) {
        const product = await Product.findById(p.productId._id);
        if (product.stock < p.quantity) {
            return res.status(400).send({ message: `Stok ${product.name} tidak mencukupi` });
        }
    }

    const order = new Order({
        userId,
        products,
        totalAmount,
    });

    await order.save();

    for (const p of cart.products) {
        const product = await Product.findById(p.productId._id);
        product.stock -= p.quantity;
        await product.save();
    }

    await Cart.findByIdAndDelete(cart._id);

    res.status(201).send({ message: 'Checkout successful', order });
});
