import React from 'react'
import { assets } from '../assets/assets'

const Navbar = ({ setToken }) => {
  return (
    <div
      className="flex items-center py-2 px-[4%] justify-between"
      style={{
        background: 'linear-gradient(90deg, #c1ff72, #055c38ff )',
      }}
    >
      <img className="w-[max(10%,80px)]" src={assets.logo} alt="Logo" />
      <button
        onClick={() => setToken('')}
        className="bg-white text-black px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-md hover:opacity-90 transition-opacity"
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar
