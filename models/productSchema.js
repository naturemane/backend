import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }], // Updated to be an array of image URLs
    category: { type: String, required: true },
    soldCount: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
}, { timestamps: true });

const productModel = mongoose.model("Product", productSchema);

export default productModel;
