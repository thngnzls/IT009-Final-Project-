import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ncrBarangayMap = {
    "Manila": {
        "1000": ["Ermita", "Malate", "Paco", "Pandacan", "Sampaloc", "San Miguel", "Santa Mesa", "Tondo"],
        "1008": ["Santa Cruz"],
        "1016": ["Quiapo"],
        "1017": ["Binondo", "Intramuros"],
    },
      "Quezon City": {
        "1100": ["Diliman", "Loyola Heights", "UP Campus", "Ateneo Campus"],
        "1101": ["Project 6", "Bagong Pag-asa"],
        "1102": ["Veterans Village", "Bahay Toro"],
        "1103": ["Cubao", "E. Rodriguez", "Imelda"],
        "1104": ["San Francisco Del Monte", "Bungad"],
        "1105": ["Galas", "San Isidro Labrador"],
        "1106": ["Timog", "South Triangle", "Laging Handa"],
        "1107": ["Project 4", "Roxas District"],
        "1108": ["Project 7", "Bago Bantay"],
        "1109": ["Project 8", "Sangandaan"],
        "1110": ["Novaliches Proper", "Sauyo"],
        "1112": ["Commonwealth", "Holy Spirit"],
        "1113": ["Fairview", "Lagro"],
        "1116": ["Kamuning", "Pinagkaisahan"],
        "1118": ["Murphy, Cubao"],
        "1120": ["Katipunan", "Ugong Norte"],
        "1121": ["Tandang Sora"],
        "1123": ["Libis", "Bagumbayan", "Eastwood City"],
        "1125": ["Diliman", "Matandang Balara"],
        
    },
    "Makati": {
        "1200": ["Poblacion", "Urdaneta", "Bel-Air"],
        "1224": ["Ayala Triangle"],
        "1235": ["Salcedo Village"],
        // ... many more zip codes in Makati
    },
    "Pasig": {
        "1600": ["Ortigas Center", "Kapitolyo", "Ugong"],
        "1604": ["Caniogan"],
        "1605": ["Maybunga"],
    },
    "Taguig": {
        "1630": ["Fort Bonifacio (BGC)", "Ususan"],
        "1634": ["Western Bicutan"],
    },
    "Caloocan": {
        "1400": ["Grace Park East", "Grace Park West"],
        "1405": ["Monumento"],
    },
    "Las Piñas": {
        "1740": ["Almanza", "Pilar Village"],
        "1750": ["BF International"],
    },
    "Pasay": {
        "1300": ["San Isidro", "Malibay"],
        "1308": ["Tambo"],
    },
    // Simplified entries for cities with fewer known postal districts
    "Mandaluyong": { "1550": ["Plainview", "Highway Hills"] },
    "San Juan": { "1500": ["Greenhills", "Little Baguio"] },
    "Valenzuela": { "1440": ["Polo", "Malinta"] },
    "Marikina": { "1800": ["Barangka", "Concepcion Uno"] },
    "Navotas": { "1409": ["Navotas West", "San Roque"] },
    "Malabon": { "1404": ["Tonsuya", "Dampalit"] },
    "Muntinlupa": { "1770": ["Alabang", "Ayala Alabang"] },
    "Pateros": { "1620": ["Aguho", "Sto. Rosario"] },
};

const cityOptions = Object.keys(ncrBarangayMap);

const PlaceOrder = () => {
    const [method, setMethod] = useState('cod');
    const {
        navigate,
        backendUrl,
        token,
        cartItems,
        setCartItems,
        getCartAmount,
        delivery_fee,
        products,
        user
    } = useContext(ShopContext);
    
    // State for available barangays based on the selected city
    const [availableBarangays, setAvailableBarangays] = useState([]);

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        barangay: user?.address?.barangay || '', 
        zipcode: user?.address?.zipcode || '',
        phone: user?.phone || ''
    });

    // Populate form data and initial barangay list
    useEffect(() => {
        if (user) {
            const initialCity = user.address?.city || '';
            const initialFormData = {
                // ... (existing field initialization)
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                street: user.address?.street || '',
                city: initialCity,
                barangay: user.address?.barangay || '', 
                zipcode: user.address?.zipcode || '',
                phone: user.phone || ''
            };
            setFormData(initialFormData);

            // Populate initial barangays if a city is already set
            if (initialCity) {
                updateBarangayOptions(initialCity);
            }
        }
    }, [user, navigate]);

    // Helper to update the list of available barangays
    const updateBarangayOptions = (city) => {
        const cityData = ncrBarangayMap[city];
        if (cityData) {
            // Flatten the map's values (all barangays under all zip codes)
            const allBarangays = Object.values(cityData).flat().sort();
            setAvailableBarangays(allBarangays);
        } else {
            setAvailableBarangays([]);
        }
    };

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({ ...data, [name]: value }));
    };

    // 🚀 MODIFIED: Handles city change and updates barangay list
    const onCityChangeHandler = (event) => {
        const newCity = event.target.value;
        
        // 1. Update form data, clearing barangay and zipcode
        setFormData(data => ({ 
            ...data, 
            city: newCity, 
            barangay: '', // Reset barangay
            zipcode: ''  // Reset zipcode
        }));
        
        // 2. Update the available barangay options
        updateBarangayOptions(newCity);
    };

    // 🚀 NEW HANDLER: Handles barangay change and auto-populates zip code
    const onBarangayChangeHandler = (event) => {
        const newBarangay = event.target.value;
        const currentCity = formData.city;
        let newZipcode = '';

        if (currentCity && newBarangay) {
            const cityData = ncrBarangayMap[currentCity];
            
            // Search through the CityData map (Zipcode -> [Barangays]) to find the matching zipcode
            for (const zip in cityData) {
                if (cityData[zip].includes(newBarangay)) {
                    newZipcode = zip;
                    break;
                }
            }
            
            if (newZipcode) {
                toast.info(`Zipcode automatically set to ${newZipcode}`);
            }
        }

        // Update both barangay and zipcode
        setFormData(data => ({ 
            ...data, 
            barangay: newBarangay, 
            zipcode: newZipcode 
        }));
    };

    // --------------------------------------------------
    // ✅ MODIFIED: Submission Handler to include delivery_fee
    // --------------------------------------------------
    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        if (getCartAmount() === 0) {
            toast.error("Your cart is empty. Please add items before placing an order.");
            return;
        }

        // ⚠️ Final check to ensure City and Barangay are selected
        if (!formData.city || !formData.barangay) {
            toast.error("Please select both City and Barangay for delivery.");
            return;
        }

        try {
            let orderItems = [];
            // Structure cart items for the backend
            for (const productId in cartItems) {
                for (const size in cartItems[productId]) {
                    if (cartItems[productId][size] > 0) {
                        const productInfo = products.find(product => product._id === productId);
                        if (productInfo) {
                            // Cloning and adding size and quantity
                            const itemInfo = structuredClone(productInfo);
                            itemInfo.size = size;
                            itemInfo.quantity = cartItems[productId][size];
                            itemInfo.name = productInfo.name; 
                            orderItems.push(itemInfo);
                        }
                    }
                }
            }
            
            let endpoint = method === 'stripe' ? '/api/order/place-stripe' : '/api/order/place'; 

            let orderData = {
                // Ensure 'barangay' is part of the address object sent to the backend
                address: formData, 
                items: orderItems,
                amount: getCartAmount() + delivery_fee, 
                // 💡 CRUCIAL: Send the delivery fee separately for the backend to use in Stripe API
                delivery_fee: delivery_fee,
            };

            const response = await axios.post(backendUrl + endpoint, orderData, { headers: { token } });

            if (response.data.success) {
                if (method === 'stripe' && response.data.session_url) {
                    // 🎯 This redirects the user to the Stripe-hosted sandbox payment page
                    window.location.replace(response.data.session_url);
                } else {
                    setCartItems({});
                    toast.success("Order placed successfully!");
                    navigate('/orders');
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Order submission error:", error);
            toast.error("An error occurred while placing the order.");
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                    <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                </div>
                <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='House no. and Street Address' />
                <div className='flex gap-3'>
                    {/* 1. City Dropdown */}
                    <select
                        required
                        name="city"
                        value={formData.city}
                        onChange={onCityChangeHandler}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                    >
                        <option value="">Select City (NCR)</option>
                        {cityOptions.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    {/* 2. Barangay Dropdown (Conditional) */}
                    <select
                        required
                        name="barangay"
                        value={formData.barangay}
                        onChange={onBarangayChangeHandler}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        disabled={!formData.city} 
                    >
                        <option value="">
                            {formData.city ? 'Select Division' : 'Select a City First'}
                        </option>
                        {availableBarangays.map(barangay => (
                            <option key={barangay} value={barangay}>{barangay}</option>
                        ))}
                    </select>
                </div>
                <input 
                    required 
                    onChange={onChangeHandler} 
                    name='zipcode' 
                    value={formData.zipcode} 
                    className='border border-gray-300 rounded py-1.5 px-3.5 w-full' 
                    type="text" 
                    placeholder='Zipcode (Auto-filled)'
                    readOnly // 💡 Recommended: make this read-only if it auto-populates
                />
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
            </div>

            {/* ------------- Right Side (Cart & Payment) ------------------ */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>
                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        {/* Stripe Selection */}
                        <div onClick={() => setMethod('stripe')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer rounded-lg transition-all duration-200 ${method === 'stripe' ? 'border-green-500 shadow-md' : 'border-gray-300'}`}>
                            <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400 border-green-400' : 'border-gray-400'}`}></div>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe Logo" />
                        </div>
                        {/* COD Selection */}
                        <div onClick={() => setMethod('cod')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer rounded-lg transition-all duration-200 ${method === 'cod' ? 'border-green-500 shadow-md' : 'border-gray-300'}`}>
                            <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400 border-green-400' : 'border-gray-400'}`}></div>
                            <p className=' text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>
                    <div className='w-full text-end mt-8'>
                        <button
                            type='submit'
                            className='bg-black text-white px-16 py-3 text-sm font-medium rounded hover:bg-gray-800 transition-colors'
                        >
                            {method === 'stripe' ? 'PROCEED TO PAYMENT' : 'PLACE ORDER'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;