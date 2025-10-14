import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartWishlistContext = createContext();
const API_URL = "http://localhost:5000/api";

export function CartWishlistProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // ===== Fetch Cart =====
  const fetchCart = async () => {
    if (!token) return setCart([]);
    try {
      const res = await axios.get(`${API_URL}/cart`, config);
      setCart(res.data);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCart([]);
    }
  };

  // ===== Fetch Wishlist =====
  const fetchWishlist = async () => {
    if (!token) return setWishlist([]);
    try {
      const res = await axios.get(`${API_URL}/wishlist`, config);
      setWishlist(res.data);
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      setWishlist([]);
    }
  };

  // ===== Cart Functions =====
  const addToCart = async (product) => {
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      await updateCartQuantity(product._id, existing.quantity + 1);
    } else {
      try {
        await axios.post(`${API_URL}/cart/add`, { productId: product._id, quantity: 1 }, config);
        await fetchCart(); // ✅ refetch updated cart
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      await axios.post(`${API_URL}/cart/update`, { productId, quantity }, config);
      await fetchCart(); // ✅ refetch immediately after update
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.post(`${API_URL}/cart/remove`, { productId }, config);
      await fetchCart(); // ✅ refetch immediately after remove
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      await axios.post(`${API_URL}/cart/clear`, {}, config);
      await fetchCart(); // ✅ refetch cleared cart
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Wishlist Functions =====
  const addToWishlist = async (product) => {
    const existing = wishlist.find((item) => item._id === product._id);
    if (!existing) {
      try {
        await axios.post(`${API_URL}/wishlist/add`, { productId: product._id }, config);
        await fetchWishlist(); // ✅ update wishlist immediately
      } catch (err) {
        console.error(err);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.post(`${API_URL}/wishlist/remove`, { productId }, config);
      await fetchWishlist(); // ✅ refetch after remove
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Fetch on login/logout =====
  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [token]);

  return (
    <CartWishlistContext.Provider
      value={{
        cart,
        wishlist,
        fetchCart,
        fetchWishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        setCart,
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
}

export function useCartWishlist() {
  return useContext(CartWishlistContext);
}
