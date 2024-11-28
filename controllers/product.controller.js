import productModel from "../models/productSchema.js";

const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, description, category, images } = req.body;
    
    // Check if all required fields are provided
    if (!name || !price || !quantity || !description || !category || !images || !images.length) {
      return res
        .status(400)
        .json({ message: "All/Portion of Data not Found or No Images Provided!" });
    }

    // Create new product
    const newData = await productModel.create({
      name,
      price,
      quantity,
      description,
      category,
      images, // Store the array of image URLs
    });

    res.status(201).json(newData);
  } catch (err) {
    console.error(err); // Added error logging for debugging
    res.status(400).json({ error: "Bad Request" });
  }
};


const getProducts = async (req, res) => {
  const { limit, sortBySoldCount } = req.query;

  try {
    let query = productModel.find();

    if (sortBySoldCount === "true") {
      query = query.sort({ soldCount: -1 });
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const products = await query.exec();

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const response = await productModel.findById(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getProductByCateg = async (req, res) => {
  const { category } = req.query;
  try {
    if (!category) {
      return res.status(400).json({ message: "Category not provided!" });
    }

    const products = await productModel.find({ category });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for the specified category!" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const response = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Product deleted",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByCateg,
};
