"use client"

import { useContext, useState } from "react"
import { ShopContext } from "../context/ShopContext"
import { Link } from "react-router-dom"
import { toast } from "react-toastify" 

const MAX_CART_QUANTITY = 10; // 🚨 Define the limit

// 1. ACCEPT THE 'stock' PROP
const ProductItem = ({ id, image, name, price, stock, addToCart }) => {
    // 🚨 UPDATED: Import cartItems from ShopContext
    const { currency, addToWishlist, removeFromWishlist, wishlistItems, cartItems } = useContext(ShopContext)
    const [isHovered, setIsHovered] = useState(false)

    // DETERMINE IF PRODUCT IS OUT OF STOCK
    const isOutOfStock = stock <= 0

    // Get the current quantity in the cart for this product
    const currentCartQuantity = cartItems[id] || 0; // 🚨 New variable

    // Check if item is in wishlist
    const isInWishlist = wishlistItems && wishlistItems[id]

    // Heart SVG Component (omitted for brevity)
    const HeartIcon = ({ filled = false, className = "" }) => (
        <svg
            className={className}
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
        </svg>
    )

    const toggleWishlist = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (isInWishlist) {
            removeFromWishlist && removeFromWishlist(id)
        } else {
            addToWishlist && addToWishlist(id)
        }
    }

    // 2. MODIFIED Add to Cart Handler with Limit Check
    const handleAddToCartClick = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (isOutOfStock) {
            toast.error(`"${name}" is currently out of stock.`)
            return
        }

        // 🚨 NEW LOGIC: Check if adding 1 more item exceeds the limit
        if (currentCartQuantity >= MAX_CART_QUANTITY) {
            toast.warn(`You can only add a maximum of ${MAX_CART_QUANTITY} units of "${name}" to your cart.`)
            return
        }
        
        // Check if adding 1 more item exceeds the available stock
        if (currentCartQuantity >= stock) {
             toast.warn(`Only ${stock} units of "${name}" are available in stock.`)
             return
        }

        addToCart && addToCart(id)
    }

    // Determine if the Add to Cart button should be disabled due to limits or stock
    const isButtonDisabled = isOutOfStock || currentCartQuantity >= MAX_CART_QUANTITY || currentCartQuantity >= stock;
    
    // Determine the button text
    let buttonText = 'Add to Cart';
    if (isOutOfStock) {
        buttonText = 'Out of Stock';
    } else if (currentCartQuantity >= MAX_CART_QUANTITY) {
        buttonText = `Max Limit Reached (${MAX_CART_QUANTITY})`;
    } else if (currentCartQuantity >= stock) {
        buttonText = `Max Stock Reached (${stock})`;
    }


    return (
        <Link
            to={`/product/${id}`}
            className="text-gray-700 cursor-pointer group block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
                <img
                    className="hover:scale-110 transition ease-in-out duration-300 w-full aspect-square object-cover"
                    src={image && image[0] ? image[0] : "/placeholder.svg?height=300&width=300"}
                    alt={name}
                />

                {/* --- Out of Stock / Limit Reached Badge --- */}
                {(isOutOfStock || currentCartQuantity >= MAX_CART_QUANTITY) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-lg z-10">
                        {isOutOfStock ? 'OUT OF STOCK' : `LIMIT ${MAX_CART_QUANTITY}`}
                    </div>
                )}
                
                {/* Heart Icon - Always visible, positioned in top-right */}
                <button
                    onClick={toggleWishlist}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 z-20"
                >
                    <HeartIcon
                        filled={isInWishlist}
                        className={`w-5 h-5 transition-colors duration-200 ${
                            isInWishlist ? "text-red-500" : "text-gray-600 hover:text-red-500"
                        }`}
                    />
                </button>

                {/* Optional: Wishlist badge */}
                {isInWishlist && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium z-20">
                        ♥ Saved
                    </div>
                )}

                {/* 3. Add to Cart button: DISABLED when limit or stock is reached */}
                <button
                    onClick={handleAddToCartClick}
                    disabled={isButtonDisabled} // 👈 Use the combined disabled state
                    className={`absolute inset-x-0 bottom-0 py-2 text-sm font-semibold text-white transition-all duration-300 z-10 
                        ${isButtonDisabled 
                            ? "bg-gray-400 cursor-not-allowed translate-y-0 opacity-100" // Always visible and gray when OOS or limit reached
                            : "bg-green-500 hover:bg-green-600" // Green when available
                        }
                        ${isButtonDisabled 
                            ? "" // Do not hide when disabled
                            : isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"} 
                        sm:translate-y-0 sm:opacity-100 `} 
                >
                    {buttonText}
                </button>
            </div>

            {/* Product Info with Heart Icon on the left of name */}
            <div className="pt-3 pb-1">
                <div className="flex items-center gap-2 mb-1">
                    {/* Heart icon next to product name (optional and clickable) */}
                    <button
                        onClick={toggleWishlist}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <HeartIcon
                            filled={isInWishlist}
                            className={`w-4 h-4 transition-colors duration-200 ${
                                isInWishlist ? "text-red-500" : "text-gray-400 hover:text-red-500"
                            }`}
                        />
                    </button>
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 flex-1">{name}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                    {currency}
                    {price}
                </p>
            </div>
        </Link>
    )
}

export default ProductItem