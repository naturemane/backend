import express from "express"
import ContactController from "../controllers/contact.controller.js"
const Contactrouter = express.Router()

Contactrouter.get("/contacts" , ContactController.getContacts)
Contactrouter.post("/contacts" , ContactController.createConatct)
Contactrouter.delete("/contacts/:id" , ContactController.deleteContact)
Contactrouter.get("/contacts/:id" , ContactController.getContactById)

export default Contactrouter;