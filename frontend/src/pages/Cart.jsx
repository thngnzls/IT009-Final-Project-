import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import { toast } from 'react-toastify'; // 🚨 IMPORT TOASTIFY

// Define the maximum allowed quantity
const MAX_CART_QUANTITY = 10; 

const Cart = () => {

  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  useEffect(() => {

    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item]
            })
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products])

  return (
    <div className='border-t pt-14'>

      <div className=' text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {
          cartData.map((item, index) => {

            const productData = products.find((product) => product._id === item._id);

            return (
              <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                <div className=' flex items-start gap-6'>
                  <img className='w-16 sm:w-20' src={productData.image[0]} alt="" />
                  <div>
                    <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                    <div className='flex items-center gap-5 mt-2'>
                      <p>{currency}{productData.price}</p>
                      <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                    </div>
                  </div>
                </div>
                {/* 🚨 MODIFIED: Updated onChange handler to include the alert */}
                <input 
                    onChange={(e) => {
                        const newQuantity = Number(e.target.value);
                        
                        if (newQuantity === '' || newQuantity === 0) {
                            return; 
                        }
                        
                        // Check if the user tried to enter a number higher than the max
                        if (newQuantity > MAX_CART_QUANTITY) {
                            // 🚨 ALERT IS INSERTED HERE
                            toast.error(`Maximum quantity limit of ${MAX_CART_QUANTITY} reached for ${productData.name}.`);
                        }

                        // Ensure the quantity passed to updateQuantity doesn't exceed the limit
                        const finalQuantity = Math.min(newQuantity, MAX_CART_QUANTITY);

                        updateQuantity(item._id, item.size, finalQuantity);
                    }} 
                    className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' 
                    type="number" 
                    min={1} 
                    max={MAX_CART_QUANTITY} 
                    defaultValue={item.quantity} 
                />
                <img onClick={() => updateQuantity(item._id, item.size, 0)} className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin_icon} alt="" />
              </div>
            )

          })
        }
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className=' w-full text-end'>
            <button onClick={() => navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
          </div>
        </div>
        
      </div>

    </div>
  )
}

export default Cart