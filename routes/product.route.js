import express from "express";

import productController from "../controllers/product.controller.js";
const productRouter = express.Router();

productRouter.get("/products" , productController.getProducts)
productRouter.get("/products/:id" , productController.getProductById)
productRouter.put("/products/:id" , productController.updateProduct)
productRouter.delete("/products/:id" , productController.deleteProduct)
productRouter.post("/products" , productController.createProduct)
productRouter.get("/productsCateg" , productController.getProductByCateg)


export default productRouter;