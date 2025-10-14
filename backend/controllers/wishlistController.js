import Wishlist from "../models/Wishlist.js";

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    res.status(200).json(wishlist ? wishlist.products : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    res.status(200).json(wishlist.products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
    await wishlist.save();
    res.status(200).json(wishlist.products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear wishlist
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }
    res.status(200).json({ message: "Wishlist cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
