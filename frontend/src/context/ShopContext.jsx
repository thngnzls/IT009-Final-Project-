import { createContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export const ShopContext = createContext()

const ShopContextProvider = (props) => {
  const currency = "₱"
  const delivery_fee = 50
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [search, setSearch] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [cartItems, setCartItems] = useState({})
  const [wishlistItems, setWishlistItems] = useState({})
  const [products, setProducts] = useState([])
  const [token, setToken] = useState("")
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // *** MODIFIED: Uses 'DefaultItem' key when size is not provided, and adds success toast. ***
  const addToCart = async (itemId, size) => {
    
    // Use a fixed key if no size is provided (i.e., from the Collection page)
    const itemKey = size || 'DefaultItem'; 

    const cartData = structuredClone(cartItems)
    if (!cartData[itemId]) cartData[itemId] = {}
    cartData[itemId][itemKey] = (cartData[itemId][itemKey] || 0) + 1
    setCartItems(cartData)

    // Find the product name and show success toast (moved from Collection.jsx)
    const productName = products.find(p => p._id === itemId)?.name || 'Product';
    toast.success(`${productName} added to cart! 🛒`);

    if (token) {
      try {
        // Send the fixed key as the size parameter to the backend
        await axios.post(backendUrl + "/api/cart/add", { itemId, size: itemKey }, { headers: { token } })
      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }
  }
  // ----------------------------------------------------------------------------------------

  const addToWishlist = async (itemId) => {
    const wishlistData = structuredClone(wishlistItems)
    wishlistData[itemId] = true
    setWishlistItems(wishlistData)
    localStorage.setItem("wishlist", JSON.stringify(wishlistData))
    if (token) {
      try {
        await axios.post(backendUrl + "/api/wishlist/add", { itemId }, { headers: { token } })
        toast.success("Added to wishlist! ❤️")
      } catch (error) {
        console.log(error)
        toast.error("Failed to add to wishlist")
      }
    } else {
      toast.success("Added to wishlist! ❤️")
    }
  }

  const removeFromWishlist = async (itemId) => {
    const wishlistData = structuredClone(wishlistItems)
    delete wishlistData[itemId]
    setWishlistItems(wishlistData)
    localStorage.setItem("wishlist", JSON.stringify(wishlistData))
    if (token) {
      try {
        await axios.post(backendUrl + "/api/wishlist/remove", { itemId }, { headers: { token } })
        toast.info("Removed from wishlist")
      } catch (error) {
        console.log(error)
        toast.error("Failed to remove from wishlist")
      }
    } else {
      toast.info("Removed from wishlist")
    }
  }

  const getWishlistCount = () => Object.keys(wishlistItems).length

  const clearWishlist = () => {
    setWishlistItems({})
    localStorage.removeItem("wishlist")
    if (token) {
      axios.post(backendUrl + "/api/wishlist/clear", {}, { headers: { token } }).catch(console.log)
    }
  }

  const getUserWishlist = async (token) => {
    try {
      const response = await axios.post(backendUrl + "/api/wishlist/get", {}, { headers: { token } })
      if (response.data.success) {
        setWishlistItems(response.data.wishlistData || {})
        localStorage.setItem("wishlist", JSON.stringify(response.data.wishlistData || {}))
      }
    } catch (error) {
      console.log(error)
      const localWishlist = localStorage.getItem("wishlist")
      if (localWishlist) setWishlistItems(JSON.parse(localWishlist))
    }
  }

  const getCartCount = () => {
    let totalCount = 0
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) totalCount += cartItems[items][item]
      }
    }
    return totalCount
  }

  const updateQuantity = async (itemId, size, quantity) => {
    const cartData = structuredClone(cartItems)
    if (!cartData[itemId]) cartData[itemId] = {}
    cartData[itemId][size] = quantity
    setCartItems(cartData)
    if (token) {
      try {
        await axios.post(backendUrl + "/api/cart/update", { itemId, size, quantity }, { headers: { token } })
      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }
  }

  const getCartAmount = () => {
    let totalAmount = 0
    for (const items in cartItems) {
      const itemInfo = products.find((product) => product._id === items)
      if (!itemInfo) continue
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalAmount += itemInfo.price * cartItems[items][item]
        }
      }
    }
    return totalAmount
  }

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list")
      if (response.data.success) {
        setProducts(response.data.products.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(backendUrl + "/api/cart/get", {}, { headers: { token } })
      if (response.data.success) {
        setCartItems(response.data.cartData)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const getUserProfile = async (token) => {
    try {
      const response = await axios.get(backendUrl + "/api/user/profile", {
        headers: { token }
      })
      if (response.data.success) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getProductsData()
    const localWishlist = localStorage.getItem("wishlist")
    if (localWishlist) setWishlistItems(JSON.parse(localWishlist))
  }, [])

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      const storedToken = localStorage.getItem("token")
      setToken(storedToken)
      getUserCart(storedToken)
      getUserWishlist(storedToken)
      getUserProfile(storedToken)
    }
    if (token) {
      getUserCart(token)
      getUserWishlist(token)
      getUserProfile(token)
    }
  }, [token])

  const value = {
  products,
  currency,
  delivery_fee,
  search,
  setSearch,
  showSearch,
  setShowSearch,
  cartItems,
  addToCart,
  setCartItems,
  getCartCount,
  updateQuantity,
  getCartAmount,
  navigate,
  backendUrl,
  setToken,
  token,
  user,
  setUser,
  wishlistItems,
  setWishlistItems,
  addToWishlist,
  removeFromWishlist,
  getWishlistCount,
  clearWishlist,
}


  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
}

export default ShopContextProvider