import express from 'express'
import {
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus,
    verifyStripe,
    verifyRazorpay,
    cancelOrder
} from '../controllers/orderController.js'

import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list', adminAuth, allOrders)
// Endpoint for admin to update status manually (kept as adminAuth)
orderRouter.post('/status', adminAuth, updateStatus)

// Payment Features
orderRouter.post('/place', authUser, placeOrder)
// 💡 MODIFIED: Changed path from '/stripe' to '/place-stripe' to match frontend PlaceOrder.jsx
orderRouter.post('/place-stripe', authUser, placeOrderStripe) 
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// User Features
orderRouter.post('/userorders', authUser, userOrders)

orderRouter.post('/return-request', authUser, updateStatus)

// Cancel Order
orderRouter.post('/cancel', authUser, cancelOrder)
// Verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

export default orderRouter