
import express from "express"
import sendMail from "../controllers/mailController.js"
 const mailRouter = express.Router()

 mailRouter.post("/contacts/send" , sendMail)
 export default mailRouter