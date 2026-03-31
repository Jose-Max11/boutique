import SharedWishlist from "../models/SharedWishlist.js";
import Wishlist from "../models/Wishlist.js";
import { v4 as uuidv4 } from "uuid";

// 🔗 CREATE SHARE LINK
export const createSharedWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist || wishlist.products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Wishlist is empty",
      });
    }

    const shareId = uuidv4();

    const shared = new SharedWishlist({
      shareId,
      products: wishlist.products,
    });

    await shared.save();

    res.json({
      success: true,
      shareLink: `http://localhost:5173/shared-wishlist/${shareId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 🌐 GET SHARED WISHLIST
export const getSharedWishlist = async (req, res) => {
  try {
    const { shareId } = req.params;

    const shared = await SharedWishlist.findOne({ shareId })
      .populate("products");

    if (!shared) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    res.json({
      success: true,
      wishlist: shared.products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};