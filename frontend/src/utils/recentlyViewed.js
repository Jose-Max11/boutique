// src/utils/recentlyViewed.js

// Get all recently viewed items
export const getRecentlyViewed = () => {
  const data = localStorage.getItem("recentlyViewed");
  return data ? JSON.parse(data) : [];
};

// Add a product to recently viewed
export const addRecentlyViewed = (product) => {
  let items = getRecentlyViewed();

  // Remove existing if already present
  items = items.filter((i) => i._id !== product._id);

  // Add new product to front
  items.unshift(product);

  // Limit to 10 items
  if (items.length > 10) items = items.slice(0, 10);

  // Save back to local storage
  localStorage.setItem("recentlyViewed", JSON.stringify(items));
};
