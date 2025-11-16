import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets' // Ensure you have refund_icon in your assets

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2'>
      <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>

        {/* Dashboard Link */}
        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/sales-analytics" 
        >
          <img className='w-5 h-5' src={assets.dashboard} alt="" />
          <p className='hidden md:block'>Dashboard</p>
        </NavLink>

        {/* Add Items Link */}
        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/add"
        >
          <img className='w-5 h-5' src={assets.add_icon} alt="" />
          <p className='hidden md:block'>Add Items</p>
        </NavLink>

        {/* Product Items Link */}
        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/list"
        >
          <img className='w-5 h-5' src={assets.list_icon} alt="" />
          <p className='hidden md:block'>Product Items</p>
        </NavLink>

        {/* Orders Link */}
        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/orders"
        >
          <img className='w-5 h-5' src={assets.order_icon} alt="" />
          <p className='hidden md:block'>Orders</p>
        </NavLink>
      
        {/* Inventory Data Link */}
        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/inventory"
        >
          <img className='w-5 h-5' src={assets.inventory_icon} alt="" /> 
          <p className='hidden md:block'>Inventory Data</p>
        </NavLink>

        {/* Admin Users Link */}
        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/user"
        >
          <img className='w-5 h-5' src={assets.user_icon || assets.order_icon} alt="" /> 
          <p className='hidden md:block'>Admin Users</p>
        </NavLink>

        {/* Customers Account Link */}
        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/customer-data"
        >
          <img className='w-5 h-5' src={assets.user_icon || assets.order_icon} alt="" /> 
          <p className='hidden md:block'>Customers Account</p>
        </NavLink>

      </div>
    </div>
  )
}

export default Sidebar;