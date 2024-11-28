import contactModel from "../models/contactSchema.js";

const createConatct = async(req, res) => {
    try {
        const response = await contactModel.create(req.body)
        res.status(201).json({
            data:response , 
            message: "Contact is created"
        })
    } catch (error) {
        res.status(400).json({message :error.message})
        
    }
}

const getContacts = async(req , res) => {
    try {
        const response = await contactModel.find()
        res.status(200).json({
            data:response,
            message: "All contacts are fetched"
        })
    } catch (error) {
        res.status(400).json({message : error.message})
    }
}

const getContactById = async(req, res )=> {
    try {
        const response = await contactModel.findById(req.params.id)
        res.status(200).json({
            data:response,
            message:"Contact is fetched"
        })
    } catch (error) {
        res.status.json({
            message:error.message
        })
        
    }
}

const deleteContact = async(req, res) => {
   try {
    await contactModel.findByIdAndDelete(req.params.id)
    res.status(200).json({
        message:"Contact deleted"
    })
   } catch (error) {
    res.status(400).json({message : error.message})
    
   }
}

export default {
    createConatct,
    getContactById,
    getContacts,
    deleteContact

}