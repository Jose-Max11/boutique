import mongoose from "mongoose";

// ========================
// Sub-schema for Sizes
// ========================
const sizeSchema = new mongoose.Schema({
size: { type: String, required: true },  // Example: "S", "M", "L"
  price: { type: Number, required: true }         // Optional: Image URL for that size
});

// ========================
// Main Product Schema
// ========================
const productSchema = new mongoose.Schema(
  {
    // ===== Basic Details =====
    name: { type: String, required: true },
    description: { type: String },
    sku: { type: String }, // Product code or SKU
    price: { type: Number, required: true },
    costPrice: { type: Number },
    discount: { type: Number, default: 0 }, // Percentage
    offer: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    unit: { type: String, default: "pcs" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    availability: { type: String, default: "In Stock" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    // ===== Media / Images =====
    images: [{ type: String }],           // Product images
    referenceImage: { type: String },     // Reference or design image
    materialImage: { type: String },      // Fabric or material image

    // ===== Design & Fabric Details =====
    fabric: { type: String },
    fabricType: { type: String },
    pattern: { type: String },
    combo: { type: String },
    sleeveLength: { type: String },
    sleeveType: { type: String },
    neckType: { type: String },
    dressType: { type: String },
    fitType: { type: String },
    length: { type: String },
    transparency: { type: String },
    liningMaterial: { type: String },
    washCare: { type: String },
    occasion: { type: String },           // e.g., Casual, Party, Bridal
    countryOfOrigin: { type: String },
    sellerName: { type: String },

    // ===== Size & Color Variants =====
    sizes: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ],                  // Array of size details
    color: [{ type: String }],  
    colorLabels: { type: [String]} ,            // e.g., ["Red", "Blue", "Black"]

    // ===== Measurement Info =====
    bustSize: { type: String },
    waistSize: { type: String },
    hipSize: { type: String },
    shoulderSize: { type: String },

    // ===== Pricing and Offers =====
    mrp: { type: Number },                // Maximum retail price
    sellingPrice: { type: Number },       // After discount
    taxIncluded: { type: Boolean, default: true },
    returnPolicy: { type: String, default: "7 Days Easy Return" },

    // ===== Reviews and Ratings =====
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ===== Comments Section =====
    comments: [
      {
        text: { type: String },
        author: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],

    // ===== Sales Tracking =====
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    // ===== Tags for Search/Filters =====
    tags: [{ type: String }],

    // ===== Admin Control =====
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
