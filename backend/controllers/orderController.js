import Order from "../models/Order.js";

// Place a new order
export const placeOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, paymentMethod, billingDetails } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderNumber = `ORDER${Date.now()}`;

    // Create order document
    const newOrder = new Order({
      userId,
      orderNumber,
      items: items.map((item) => ({
        product: item.product._id || item.product,
        name: item.product.name || item.name,
        price: item.product.price || item.price,
        quantity: item.quantity,
        image: item.product.image || item.image,
      })),
      totalAmount,
      paymentMethod,
      billingDetails,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all orders of a user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get order by order number
export const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    console.error("Get order by number error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
