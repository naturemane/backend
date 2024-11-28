import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    fullName:{type:String , required: true},
    email:{type:String , required: true},
    subject: {type:Number , required:true},
    message :{type: String , required:true}
})


const contactModel  = mongoose.model ("Contact" , contactSchema)
export default contactModel;
