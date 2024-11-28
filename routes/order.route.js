import express from 'express';

import orderController from '../controllers/order.controller.js';

const orderRouter = express.Router();

orderRouter.get('/order', orderController.getOrders)
orderRouter.get('/order/:id', orderController.getOrderById)
orderRouter.post('/order', orderController.createOrder)
// orderRouter.put('/order/:id', orderController.updateOrder)
orderRouter.put('/updateOrder/:id', orderController.updateOrder)
orderRouter.get('/orderData', orderController.dashboardData)
orderRouter.get('/dailyData', orderController.getDailyChartData)
orderRouter.get('/monthlyData', orderController.getMonthlyChartData)
orderRouter.put('/softDelete/:id', orderController.deleteOrder)
orderRouter.post('/orderMail', orderController.sendMail)
orderRouter.post('/userOrderMail', orderController.sendUserMail)
orderRouter.post('/statusMail', orderController.sendStatusMail)



export default orderRouter