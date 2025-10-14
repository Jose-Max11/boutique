import Cart from "../models/Cart.js";

// Get current user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");
    res.status(200).json(cart ? cart.products : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, products: [] });
    }

    const index = cart.products.findIndex((p) => p.product.toString() === productId);

    if (index > -1) {
      cart.products[index].quantity += quantity || 1;
    } else {
      cart.products.push({ product: productId, quantity: quantity || 1 });
    }

    await cart.save();
    res.status(200).json(cart.products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove product from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter((p) => p.product.toString() !== productId);
    await cart.save();
    res.status(200).json(cart.products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.products = [];
      await cart.save();
    }
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const index = cart.products.findIndex((p) => p.product.toString() === productId);

    if (index > -1) {
      cart.products[index].quantity = quantity;
      // Remove if quantity is 0
      if (quantity <= 0) cart.products.splice(index, 1);
    } else {
      return res.status(404).json({ message: "Product not in cart" });
    }

    await cart.save();
    res.status(200).json(cart.products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
