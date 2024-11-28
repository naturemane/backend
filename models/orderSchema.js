import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    city: { type: String, required: true },
    adress1: { type: String, required: true },
    adress2: { type: String },
    houseNum: { type: String },
    zip: { type: String, required: true },
    phoneNum: { type: String, required: true },
    email: { type: String, required: true },
    orderDetails: { type: String },
    order: { type: Array, required: true },
    total: { type: String, required: true },
    status: {
      type: String,
      enum: ["En Attente", "Expédié", "Livré", "Retour", "Annulé"],
      default: "En Attente",
    },
    orderId: { type: Number, unique: true },
    livName: { type: String },
    livNumber: { type: String },
    livPickUp: { type: String },
    livDeliverDate: { type: String },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
