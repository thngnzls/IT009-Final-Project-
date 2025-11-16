// orderController.js

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import razorpay from "razorpay";
import NotificationModel from "../models/Notification.js";
import { updateStockAfterOrder, restoreStockAfterCancellation } from '../controllers/productController.js'; 


const currency = "php"; 
const deliveryCharge = 50;

// 💳 Gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🔔 Notification Helper Function
const createCustomerOrderUpdateNotification = async (userId, orderId, newStatus) => {
    try {
        await NotificationModel.create({
            userId: userId,
            type: 'ORDER_STATUS_UPDATE',
            message: `Your order #${orderId.toString().substring(0, 8)} is now: ${newStatus}`,
            link: `/orders`,
            isRead: false,
        });
    } catch (notificationError) {
        console.error("Error creating customer notification:", notificationError);
    }
};

// --------------------------------------------------
// 🧾 Place order using COD (Stock updated immediately)
// --------------------------------------------------
const placeOrder = async (req, res) => {
    let newOrder = null; // Declare here so it's accessible in the catch block
    try {
        const { items, amount, address } = req.body;

        const orderData = {
            userId: req.user._id,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
            status: "Order Placed",
        };

        newOrder = new orderModel(orderData);
        await newOrder.save();

        // 🚀 1. DECREASE STOCK: Call the ATOMIC function immediately after placing the COD order
        await updateStockAfterOrder(items);

        // 🔔 NOTIFICATION: Notify customer that their order is placed
        await createCustomerOrderUpdateNotification(newOrder.userId, newOrder._id, "Order Placed");

        // Clear user cart
        await userModel.findByIdAndUpdate(req.user._id, { cartData: {} });

        res.json({ success: true, message: "Order placed successfully." });
    } catch (error) {
        console.error("Error placing COD order:", error);
        
        // ❌ CRITICAL FIX: If stock update fails, delete the order that was just saved
        if (newOrder && newOrder._id) {
            await orderModel.findByIdAndDelete(newOrder._id);
        }

        // Return a better error message to the client
        res.json({ success: false, message: error.message || "Failed to place COD order due to a server error." });
    }
};

// --------------------------------------------------
// 💵 Place order using Stripe (Stock updated in verifyStripe)
// --------------------------------------------------
const placeOrderStripe = async (req, res) => {
    let newOrder = null; 
    try {
        const { items, amount, address } = req.body;
        // 🛠️ MODIFIED: Use environment variable as a fallback for the origin URL
        const clientOrigin = req.headers.origin || process.env.FRONTEND_URL; 
        
        if (!clientOrigin) {
            return res.status(500).json({ success: false, message: "Client origin URL is not set." });
        }

        const orderData = {
            userId: req.user._id,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now(),
            status: "Pending Payment", // 🛠️ MODIFIED: Initial status set correctly
        };

        newOrder = new orderModel(orderData);
        await newOrder.save();

        // 🔔 NOTIFICATION: Notify customer that their order is pending payment
        await createCustomerOrderUpdateNotification(newOrder.userId, newOrder._id, "Pending Payment (Stripe)");

        const line_items = items.map((item) => ({
            price_data: {
                currency,
                product_data: { name: item.name },
                // 🛠️ MODIFIED: Convert price to the smallest unit (e.g., cents/centavos)
                unit_amount: Math.round(item.price * 100), 
            },
            quantity: item.quantity,
        }));

        line_items.push({
            price_data: {
                currency,
                product_data: { name: "Delivery Charges" },
                unit_amount: deliveryCharge * 100,
            },
            quantity: 1,
        });

        // 🎯 Create the Checkout Session
        const session = await stripe.checkout.sessions.create({
            // 🛠️ MODIFIED: Use the determined clientOrigin
            success_url: `${clientOrigin}/verify?success=true&orderId=${newOrder._id}`, 
            cancel_url: `${clientOrigin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: "payment",
            customer_email: address.email,
            // 🛠️ MODIFIED: Add metadata for tracking, especially for webhooks
            metadata: { 
                orderId: newOrder._id.toString(),
                userId: newOrder.userId.toString(),
            },
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error("Error placing Stripe order:", error);
         // ❌ Delete order if session creation fails
        if (newOrder && newOrder._id) {
            await orderModel.findByIdAndDelete(newOrder._id);
        }
        res.json({ success: false, message: error.message || "Failed to create Stripe payment session." });
    }
};

// --------------------------------------------------
// ✅ Verify Stripe payment (Stock updated here)
// --------------------------------------------------
const verifyStripe = async (req, res) => {
    // NOTE: This assumes your frontend sends { orderId: <id>, success: 'true'/'false' }
    const { orderId, success } = req.body;

    try {
        if (success === "true") {
            // Payment was successful on Stripe's side
            // 🛠️ MODIFIED: Update payment flag AND status to 'Processing' (or similar)
            const order = await orderModel.findByIdAndUpdate(
                orderId, 
                { payment: true, status: "Processing" }, 
                { new: true }
            );
            
            // 🚀 2. DECREASE STOCK: Only if payment is successful
            if (order) {
                // If the stock update is successful:
                await updateStockAfterOrder(order.items);
                // Clear user cart only after successful payment and stock update
                await userModel.findByIdAndUpdate(order.userId, { cartData: {} }); 
                
                // 🔔 NOTIFICATION: Notify customer of successful payment
                await createCustomerOrderUpdateNotification(order.userId, orderId, "Payment Successful");

                res.json({ success: true });
            } else {
                // Payment succeeded, but order not found (critical error)
                res.json({ success: false, message: "Payment succeeded but order record was not found." });
            }
            
        } else {
            // Payment failed or was cancelled
             // 🛠️ MODIFIED: Find and update status before deletion for a proper notification
            const failedOrder = await orderModel.findByIdAndUpdate(
                orderId, 
                { status: "Payment Failed" }, 
                { new: true }
            );
            
            // 🔔 NOTIFICATION: Notify customer of failed payment
            if(failedOrder) {
                await createCustomerOrderUpdateNotification(failedOrder.userId, orderId, "Payment Failed and Order Cancelled");
                // Delete the order record now that notification is sent
                await orderModel.findByIdAndDelete(orderId); 
            }

            res.json({ success: false });
        }
    } catch (error) {
        console.error("Error verifying Stripe payment or updating stock:", error);
        res.json({ success: false, message: error.message || "Server error during payment verification." });
    }
};

// --------------------------------------------------
// 💰 Place order using Razorpay (Stock updated in verifyRazorpay)
// --------------------------------------------------
const placeOrderRazorpay = async (req, res) => {
    let newOrder = null;
    try {
        const { items, amount, address } = req.body;

        const orderData = {
            userId: req.user._id,
            items,
            address,
            amount,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now(),
            status: "Order Placed",
        };

        newOrder = new orderModel(orderData);
        // Save the order FIRST. We will update stock upon verification.
        await newOrder.save();

        // 🔔 NOTIFICATION: Notify customer that their order is pending payment
        await createCustomerOrderUpdateNotification(newOrder.userId, newOrder._id, "Pending Payment (Razorpay)");

        // Use the total amount (including deliveryCharge)
        const totalAmount = amount + deliveryCharge; 

        const options = {
            amount: totalAmount * 100, // Amount in paisa/centavos
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString(), // Use order ID as receipt
        };

        await razorpayInstance.orders.create(options, async (error, order) => {
            if (error) {
                console.error(error);
                // Delete the order if creation fails
                await orderModel.findByIdAndDelete(newOrder._id); 
                return res.json({ success: false, message: "Failed to create Razorpay order." });
            }
            res.json({ success: true, order });
        });
    } catch (error) {
        console.error("Error placing Razorpay order:", error);
        res.json({ success: false, message: error.message });
    }
};

// --------------------------------------------------
// ✅ Verify Razorpay payment (Stock updated here)
// --------------------------------------------------
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        
        if (orderInfo.status === "paid") {
            // Get the Mongoose order ID from the receipt field
            const orderId = orderInfo.receipt;
            
            // Update order, ensuring we get the items list back
            const order = await orderModel.findByIdAndUpdate(orderId, { payment: true, status: "Processing" }, { new: true });

            // 🚀 3. DECREASE STOCK: Only if payment is successful
            if (order) {
                await updateStockAfterOrder(order.items);
                await userModel.findByIdAndUpdate(order.userId, { cartData: {} }); // Use order.userId

                // 🔔 NOTIFICATION: Notify customer of successful payment
                await createCustomerOrderUpdateNotification(order.userId, orderId, "Payment Successful");

                res.json({ success: true, message: "Payment Successful and Stock Updated" });
            } else {
                res.json({ success: false, message: "Payment successful but order record not found." });
            }
            
        } else {
            // Delete the order if payment fails
            const orderId = orderInfo.receipt;
            const failedOrder = await orderModel.findByIdAndUpdate(
                orderId, 
                { status: "Payment Failed" }, 
                { new: true }
            );

            // 🔔 NOTIFICATION: Notify customer of failed payment
            if(failedOrder) {
                await createCustomerOrderUpdateNotification(failedOrder.userId, orderId, "Payment Failed and Order Cancelled");
                await orderModel.findByIdAndDelete(orderId);
            }

            res.json({ success: false, message: "Payment Failed" });
        }
    } catch (error) {
        console.error("Error verifying Razorpay payment or updating stock:", error);
        res.json({ success: false, message: error.message });
    }
};

// 📋 All Orders (Admin)
const allOrders = async (req, res) => {
    try {
        // Populate user details to help admin identify who cancelled
        const orders = await orderModel.find({}).populate("userId", "name email");
        res.json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.json({ success: false, message: error.message });
    }
};

// 👤 User Orders
const userOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await orderModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cancel Order (Customer-side with reason)
const cancelOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const userId = req.user._id;

        const order = await orderModel.findOne({ _id: orderId, userId });
        // ... (access/status checks)

        // Only allow cancellation if the order status is "Order Placed" or "Pending Payment"
        const originalStatus = order.status;
        if (originalStatus !== "Order Placed" && originalStatus !== "Pending Payment") {
            // ... (error response)
        }

        await orderModel.findByIdAndUpdate(orderId, {
            status: "Cancelled",
            cancellationReason: reason || "No reason provided",
            cancelledAt: new Date(),
        });

        
        if (order.paymentMethod === "COD" || order.payment === true) { 
            await restoreStockAfterCancellation(order.items);
        }
        await createCustomerOrderUpdateNotification(order.userId, orderId, "Cancelled");

        res.json({ success: true, message: "Order has been successfully cancelled." });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.json({ success: false, message: error.message });
    }
};

// Update Order Status (Admin or Returns)
const updateStatus = async (req, res) => {
    try {
        const { orderId, status, returnReason } = req.body;
        
        const existingOrder = await orderModel.findById(orderId);
        if (!existingOrder) {
            return res.json({ success: false, message: "Order not found." });
        }
        
        const updateObject = { status };
        if (returnReason) updateObject.returnReason = returnReason;

        //RESTORE STOCK ON RETURN:
       
        if (status === "Returned" && existingOrder.status !== "Returned") {
            await restoreStockAfterCancellation(existingOrder.items);
        }

        // 2. Update the status
        await orderModel.findByIdAndUpdate(orderId, updateObject);

        if (existingOrder.status !== status) {
            await createCustomerOrderUpdateNotification(existingOrder.userId, orderId, status); 
        }

        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.json({ success: false, message: error.message });
    }
};

export {
    verifyRazorpay,
    verifyStripe,
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus,
    cancelOrder,
};