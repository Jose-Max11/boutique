import Compare from "../models/Compare.js";


// ✅ SAVE / UPDATE COMPARE
export const saveCompare = async (req, res) => {
  try {
    const { products } = req.body;

    let compare = await Compare.findOne({ user: req.user._id });

    if (compare) {
      compare.products = products;
      await compare.save();
    } else {
      compare = new Compare({
        user: req.user._id,
        products,
      });
      await compare.save();
    }

    res.json({
      success: true,
      compare,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ✅ GET COMPARE
export const getCompare = async (req, res) => {
  try {
    const compare = await Compare.findOne({
      user: req.user._id,
    }).populate("products");

    res.json({
      success: true,
      products: compare ? compare.products : [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ✅ CLEAR COMPARE
export const clearCompare = async (req, res) => {
  try {
    await Compare.findOneAndDelete({
      user: req.user._id,
    });

    res.json({
      success: true,
      message: "Compare cleared",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};