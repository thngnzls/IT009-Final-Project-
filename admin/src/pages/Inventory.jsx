"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { backendUrl, currency } from "../App"
import { toast } from "react-toastify"

const Inventory = ({ token }) => {
  const [list, setList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingStock, setEditingStock] = useState({}) // Track local stock edits

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list")
      if (response.data.success) {
        setList(response.data.products.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const updateStock = async (productId, newStock) => {
    newStock = Number(newStock)
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Stock cannot be negative.")
      return
    }
    setIsLoading(true)
    try {
      const response = await axios.post(
        backendUrl + "/api/product/update-stock",
        { productId, stock: newStock },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        setEditingStock(prev => {
          const copy = { ...prev }
          delete copy[productId]
          return copy
        })
        fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <h3 className="text-2xl font-bold mb-6">Product Inventory</h3>
      <div className="flex flex-col gap-2">
        {/* ------- Table Title ---------- */}
        <div className="hidden md:grid grid-cols-[1fr_2fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Product ID</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b className="text-center">Status</b>
        </div>

        {/* ------ Product List ------ */}
        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr_3fr] md:grid-cols-[1fr_2fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            <img className="w-12 h-12 object-cover" src={item.image && item.image[0]} alt="" />
            <p>{item.productId || item._id}</p>
            <p>{item.name}</p>
            <p>
              {item.category} - {item.subCategory}
            </p>
            <p>
              {currency}
              {item.price}
            </p>
            <input
              type="number"
              min="0"
              value={editingStock[item._id] ?? item.stock ?? 0}
              onChange={e => {
                const value = e.target.value
                setEditingStock(prev => ({ ...prev, [item._id]: value }))
              }}
              onBlur={e => {
                if (
                  editingStock[item._id] !== undefined &&
                  editingStock[item._id] !== String(item.stock)
                ) {
                  updateStock(item._id, editingStock[item._id])
                }
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.target.blur()
                }
              }}
              className="border p-1 w-20"
              disabled={isLoading}
            />
            <div className="text-center">
              {item.stock < 10 ? (
                <span className="text-red-500 font-bold">Low</span>
              ) : (
                <span className="text-green-600">High</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Inventory