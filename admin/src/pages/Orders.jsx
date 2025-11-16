import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { FaCheckCircle, FaTimesCircle, FaTasks, FaUndoAlt, FaTruckLoading, FaTruck, FaClock } from 'react-icons/fa';


const getOrderTimeline = (order) => {
    // Mock Data for demonstration (replace with actual data fields from your 'order' object)
    const orderDate = new Date(order.date);
    const estimatedShipDate = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
    const estimatedDeliveryDate = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    const trackingID = order._id.slice(-8).toUpperCase() + 'TID'; 

    const timeline = [];

    timeline.push({ 
        icon: <FaClock className="text-blue-500" />, 
        text: `Order Date: ${orderDate.toLocaleDateString()}` 
    });

    if (order.status === 'Processing' || order.status === 'Packed') {
        timeline.push({ 
            icon: <FaTasks className="text-indigo-500" />, 
            text: `Est. Shipping: ${estimatedShipDate.toLocaleDateString()}` 
        });
    } else if (order.status === 'Ready for Pickup') {
        timeline.push({ 
            icon: <FaTruckLoading className="text-yellow-600" />, 
            text: `Logistics: Ready for Pickup (${estimatedShipDate.toLocaleDateString()})` 
        });
        timeline.push({ 
            icon: <FaTasks className="text-indigo-500" />, 
            text: `**Tracking ID:** ${trackingID}` 
        });
    } else if (order.status === 'Picked Up' || order.status === 'In Transit' || order.status === 'Out for Delivery') {
        timeline.push({ 
            icon: <FaTruck className="text-green-600" />, 
            text: `In Transit (Tracking: ${trackingID})` 
        });
        timeline.push({ 
            icon: <FaClock className="text-green-500" />, 
            text: `**Est. Delivery:** ${estimatedDeliveryDate.toLocaleDateString()}` 
        });
    } else if (order.status === 'Delivered') {
        timeline.push({ 
            icon: <FaCheckCircle className="text-green-600" />, 
            text: `Delivered on: ${estimatedDeliveryDate.toLocaleDateString()}` 
        });
    }

    return timeline;
};


const Orders = ({ token }) => {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('active');
    const printRef = useRef();

    const cancellationReasons = [
        'Ordered by mistake',
        'Found a better price elsewhere',
        'Changed my mind',
        'Incorrect item ordered',
        'Shipping time too long',
        'Other'
    ];

    // 🔹 Fetch all orders (unchanged)
    const fetchAllOrders = async () => {
        if (!token) return;
        try {
            const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
            if (response.data.success) {
                setOrders(response.data.orders.reverse());
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // 🔹 Order filters by status (unchanged)
    const activeOrders = orders.filter(
        (order) => order.status !== 'Delivered'
            && order.status !== 'Cancelled'
            && !order.status.includes('Return')
    );
    const completedOrders = orders.filter((order) => order.status === 'Delivered');
    const cancelledOrders = orders.filter((order) => order.status === 'Cancelled' || order.status === 'Return Rejected');
    const returnRefundOrders = orders.filter((order) => order.status.includes('Return'));

    // 🔹 Update order status (General status changes: Order Placed -> Processing -> Packed -> etc.)
    const statusHandler = async (event, orderId) => {
        try {
            const response = await axios.post(
                backendUrl + '/api/order/status',
                { orderId, status: event.target.value },
                { headers: { token } }
            );
            if (response.data.success) {
                await fetchAllOrders();
                toast.success('Order status updated!');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Status Update Error:', error);
            toast.error(error.message || 'Failed to update status.');
        }
    };

    // 🔹 Print invoice (IMPLEMENTED)
    const printInvoice = (order) => {
        const invoiceContent = `
            <div style="padding: 20px; font-family: sans-serif;">
                <h1 style="text-align: center; color: #333;">INVOICE</h1>
                <p>Order ID: #${order._id.substring(0, 8)}</p>
                <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                <hr style="margin: 15px 0;">
                <h2 style="font-size: 1.2em;">Customer:</h2>
                <p>${order.address.firstName} ${order.address.lastName}</p>
                <p>${order.address.street}, ${order.address.city}, ${order.address.zipcode}</p>
                <p>Phone: ${order.address.phone}</p>
                <hr style="margin: 15px 0;">
                <h2 style="font-size: 1.2em;">Items:</h2>
                <ul style="list-style-type: none; padding: 0;">
                    ${order.items.map(item => `
                        <li style="margin-bottom: 5px;">${item.name} x ${item.quantity} (${item.size}) - ${currency}${item.price.toFixed(2)}</li>
                    `).join('')}
                </ul>
                <hr style="margin: 15px 0;">
                <h2 style="text-align: right; font-size: 1.5em; color: #cc5500;">TOTAL: ${currency}${order.amount}</h2>
                <p style="text-align: center; margin-top: 30px; font-size: 0.8em; color: #666;">Thank you for your business!</p>
            </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(invoiceContent);
        printWindow.document.close();
        printWindow.print();
        toast.info(`Generating invoice for Order #${order._id.substring(0, 8)}...`);
    };

    // 🔹 Handle return approval or rejection (IMPLEMENTED - Updates status for returns)
    const finalizeReturnAction = async (orderId, newStatus) => {
        const action = newStatus.includes('Approved') ? 'Approve' : 'Reject';
        if (!window.confirm(`Are you sure you want to ${action} the return request for this order?`)) {
            return;
        }

        try {
            // Reusing the status endpoint for return approval/rejection
            const response = await axios.post(
                backendUrl + '/api/order/status',
                { orderId, status: newStatus },
                { headers: { token } }
            );
            if (response.data.success) {
                await fetchAllOrders(); // Refresh order list
                toast.success(`Return request ${newStatus.toLowerCase().replace('return', 'Return')}!`);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Return Action Error:', error);
            toast.error(error.message || 'Failed to finalize return action.');
        }
    };

    // 🔹 Admin forced cancellation (IMPLEMENTED - Updates status and includes reason)
    const handleAdminCancel = async (orderId) => {
        if (!window.confirm('Are you sure you want to forcibly cancel this order? This action cannot be undone.')) {
            return;
        }
        
        const cancellationReason = prompt('Please enter the reason for administrative cancellation:');
        if (!cancellationReason || cancellationReason.trim() === '') {
            toast.info('Cancellation aborted: Reason is required.');
            return;
        }

        try {
            // Sending the cancellation reason along with the status
            const response = await axios.post(
                backendUrl + '/api/order/status',
                { 
                    orderId, 
                    status: 'Cancelled',
                    // This is the key change: sending cancellationReason
                    cancellationReason: `Admin Forced Cancel: ${cancellationReason.trim()}` 
                },
                { headers: { token } }
            );
            if (response.data.success) {
                await fetchAllOrders(); // Refresh order list
                toast.success('Order forcibly cancelled by admin.');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Admin Cancel Error:', error);
            toast.error(error.message || 'Failed to cancel order.');
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, [token]);

    // 🔹 Render orders by tab
    const renderOrders = (ordersToRender) => (
        <div className="mt-6">
            {ordersToRender.length === 0 ? (
                <p className="text-gray-500 p-4 border rounded-lg bg-gray-50">
                    No orders in this category.
                </p>
            ) : (
                ordersToRender.map((order, index) => {
                    const isCancelled = order.status === 'Cancelled' || order.status === 'Return Rejected';
                    const isDelivered = order.status === 'Delivered';
                    const isReturnRequested = order.status === 'Return/Refund Requested';
                    const isReturnApproved = order.status === 'Return Approved';
                    
                    const timeline = getOrderTimeline(order); // Get timeline data

                    let rowClass = 'bg-white';
                    if (isCancelled) rowClass = 'bg-red-50 opacity-90';
                    else if (isDelivered) rowClass = 'bg-green-50';
                    else if (isReturnRequested) rowClass = 'bg-yellow-100 border-yellow-300';
                    else if (isReturnApproved) rowClass = 'bg-teal-100 border-teal-300';

                    return (
                        <div
                            className={`grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr_1.5fr_1fr_auto] lg:grid-cols-[0.5fr_2fr_1fr_1.5fr_1fr_auto] gap-3 items-start border-2 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 ${rowClass}`}
                            key={index}
                        >
                            <img className="w-12" src={assets.parcel_icon} alt="Parcel icon" />
                            <div>
                                <div>
                                    {order.items.map((item, i) => (
                                        <p className="py-0.5" key={i}>
                                            {item.name} x {item.quantity} <span> {item.size} </span> {i < order.items.length - 1 ? ',' : ''}
                                        </p>
                                    ))}
                                </div>
                                <p className="mt-3 mb-2 font-medium">
                                    {order.address.firstName + ' ' + order.address.lastName}
                                </p>
                                <div>
                                    <p>{order.address.street + ','}</p>
                                    <p>{order.address.city + ', ' + order.address.zipcode}</p>
                                </div>
                                <p>{order.address.phone}</p>

                                {/* Cancellation/Return Reason */}
                                {order.status === 'Cancelled' && order.cancellationReason && (
                                    <div className="mt-4 p-3 border rounded-md border-red-500 bg-red-50">
                                        <p className="font-bold text-sm text-red-700">Cancellation Reason:</p>
                                        <p className="text-sm italic text-red-600 whitespace-pre-line">
                                            {order.cancellationReason}
                                        </p>
                                    </div>
                                )}
                                {(isReturnRequested || isReturnApproved || order.status === 'Return Rejected') && order.returnReason && (
                                    <div className={`mt-4 p-3 border rounded-md ${isReturnRequested ? 'border-yellow-400 bg-yellow-50' : isReturnApproved ? 'border-teal-400 bg-teal-50' : 'border-red-400 bg-red-50'}`}>
                                        <p className="font-bold text-sm">Return Reason:</p>
                                        <p className="text-sm italic">{order.returnReason}</p>
                                    </div>
                                )}
                                
                                {(isReturnRequested || isReturnApproved) && order.returnProofUrls && order.returnProofUrls.length > 0 && (
                                    <div className="mt-4 p-3 border rounded-md border-gray-300 bg-white">
                                        <p className="font-bold text-sm text-gray-800">Photo Proof ({order.returnProofUrls.length} image(s)):</p>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {order.returnProofUrls.map((url, i) => (
                                                <a 
                                                    key={i} 
                                                    href={url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="w-16 h-16 border rounded-md overflow-hidden hover:opacity-80 transition block"
                                                    title={`View proof image ${i+1}`}
                                                >
                                                    <img 
                                                        src={url} 
                                                        alt={`Proof ${i+1}`} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* --- Order Details (Column 3) --- */}
                            <div>
                                <p className="text-sm sm:text-[15px]">Items : {order.items.length}</p>
                                <p className="mt-3">Method : {order.paymentMethod}</p>
                                <p>Payment : {order.payment ? 'Done' : 'Pending'}</p>
                                <p>Date : {new Date(order.date).toLocaleDateString()}</p>
                                <p className="font-bold text-lg mt-3">Total: {currency}{order.amount}</p>
                            </div>
                            
                            {/* --- NEW: Logistic Timeline (Column 4) --- */}
                            <div className="flex flex-col gap-2 p-2 border rounded-lg bg-gray-100">
                                <p className="font-bold text-sm border-b pb-1 text-gray-800">Timeline Details</p>
                                {timeline.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        {item.icon}
                                        <p dangerouslySetInnerHTML={{ __html: item.text }} />
                                    </div>
                                ))}
                            </div>
                            
                            {/* --- Status Selector & Buttons (Column 5/6) --- */}
                            <div className="flex flex-col items-start col-span-2 sm:col-span-1 lg:col-span-1">
                                <button
                                    onClick={() => printInvoice(order)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mb-2 text-xs w-full sm:w-auto"
                                >
                                    Print Invoice
                                </button>

                                {/* Return Buttons - Calls finalizeReturnAction */}
                                {isReturnRequested && (
                                    <>
                                        <button
                                            onClick={() => finalizeReturnAction(order._id, 'Return Approved')}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2 text-xs w-full sm:w-auto"
                                        >
                                            ✅ Approve Return
                                        </button>
                                        <button
                                            onClick={() => finalizeReturnAction(order._id, 'Return Rejected')}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2 text-xs w-full sm:w-auto"
                                        >
                                            ❌ Reject Return
                                        </button>
                                    </>
                                )}

                                {/* Cancel Button - Calls handleAdminCancel */}
                                {order.status !== 'Cancelled' && order.status !== 'Return/Refund Requested' && order.status !== 'Return Approved' && order.status !== 'Return Rejected' && (
                                    <button
                                        onClick={() => handleAdminCancel(order._id)}
                                        className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mb-2 text-xs w-full sm:w-auto"
                                    >
                                        Force Cancel
                                    </button>
                                )}
                                
                                {/* Status Selector - Calls statusHandler */}
                                <select
                                    onChange={(event) => statusHandler(event, order._id)}
                                    value={order.status}
                                    className="p-2 font-semibold text-xs border border-gray-300 rounded-lg bg-white mt-2 w-full sm:w-auto"
                                >
                                    {/* Order Lifecycle */}
                                    <option value="Order Placed">1. Order Placed</option>
                                    <option value="Processing">2. Processing</option>
                                    <option value="Packed">3. Packed</option>
                                    {/* Logistics/Shipping Lifecycle */}
                                    <option value="Ready for Pickup">4. Ready for Pickup (Courier)</option>
                                    <option value="Picked Up">5. Picked Up (In Transit)</option>
                                    <option value="In Transit">6. In Transit (Hub)</option>
                                    <option value="Out for Delivery">7. Out for Delivery</option>
                                    <option value="Delivered">8. Delivered</option>
                                    {/* Exceptions */}
                                    <option value="Cancelled">9. Cancelled</option>
                                    {/* Returns */}
                                    <option value="Return/Refund Requested">10. Return/Refund Requested</option>
                                    <option value="Return Approved">11. Return Approved</option>
                                    <option value="Return Rejected">12. Return Rejected</option>
                                </select>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            <h3 className="text-2xl font-bold mb-6">Order Management</h3>

            {/* Tab Navigation (unchanged) */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${activeTab === 'active' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                >
                    <FaTasks /> Active Orders ({activeOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${activeTab === 'completed' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-green-600'}`}
                >
                    <FaCheckCircle /> Completed Orders ({completedOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${activeTab === 'cancelled' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                >
                    <FaTimesCircle /> Cancelled / Rejected Orders ({cancelledOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab('return_refund')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${activeTab === 'return_refund' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-orange-600'}`}
                >
                    <FaUndoAlt /> Returns & Refunds ({returnRefundOrders.length})
                </button>
            </div>

            {activeTab === 'active' && renderOrders(activeOrders)}
            {activeTab === 'completed' && renderOrders(completedOrders)}
            {activeTab === 'cancelled' && renderOrders(cancelledOrders)}
            {activeTab === 'return_refund' && renderOrders(returnRefundOrders)}
        </div>
    );
};

export default Orders;