import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoute from "./routes/auth.route.js";
import Contactrouter from "./routes/contact.route.js";
import mailRouter from "./routes/mail.route.js";
import orderRouter from "./routes/order.route.js";
import productRouter from "./routes/product.route.js";
import reviewRouter from "./routes/review.route.js";
import dbConnection from "./utils/index.js";

dotenv.config();
dbConnection();

const port = process.env.PORT || 5000
const app = express()

app.use(express.json())
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
}))

app.use("/api", authRoute);


app.use("/api" , Contactrouter);
app.use("/api" , reviewRouter);
app.use("/api" , productRouter);
app.use("/api" , mailRouter)
app.use("/api" , orderRouter);
app.get('/ping', (req, res) => {
    res.send('Server is alive');
});

const keepAlive = () => {
    setInterval(() => {
      fetch('https://e-com-backend-jzja.onrender.com/ping') 
        .then(res => res.text())
        .then(text => console.log(`Ping response: ${text}`))
        .catch(err => console.log('Error pinging the server:', err));
    }, 840000); 
  };


app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
    keepAlive();
})