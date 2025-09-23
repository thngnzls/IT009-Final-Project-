import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { Trash2, RefreshCw } from 'lucide-react'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [removedList, setRemovedList] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [subCategoryFilter, setSubCategoryFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editSubCategory, setEditSubCategory] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editBestSeller, setEditBestSeller] = useState(false)
  const [editImages, setEditImages] = useState([null, null, null, null])
  const [editDescription, setEditDescription] = useState('')
  const [editStock, setEditStock] = useState(0)
  const [editAvailability, setEditAvailability] = useState('Out of Stock')
  const [editColors, setEditColors] = useState([])

  const categories = [
    'Medical Equipment',
    'Medical Consumables',
    'Health & Wellness Peripherals'
  ]
  const subCategories = [
    'Diagnostic Tools',
    'Mobility Aids',
    'Home Monitoring Devices',
    'Personal Protective Equipment',
    'Wound Care Supplies',
    'Injection & IV Supplies',
    'Respiratory Care',
    'Diabetic Care',
    'Physical Therapy Tools'
  ]
  const colorOptions = ['green', 'black', 'white', 'gray']

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const removeProduct = async () => {
    try {
      const productToRemove = deleteProduct
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id: productToRemove._id },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        setRemovedList(prev => {
          const updated = [productToRemove, ...prev]
          return updated.slice(0, 30)
        })
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeleteModalOpen(false)
      setDeleteProduct(null)
      setDeleteConfirmText('')
    }
  }

  const recoverProduct = async (product) => {
    if (!window.confirm('Recover this product?')) return
    try {
      const response = await axios.post(
        backendUrl + '/api/product/add',
        {
          ...product,
          image: product.image || []
        },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Product recovered successfully')
        setRemovedList(prev => prev.filter(p => p._id !== product._id))
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openDeleteModal = (item) => {
    setDeleteProduct(item)
    setDeleteModalOpen(true)
    setDeleteConfirmText('')
  }

  const openEditModal = (item) => {
    setEditProduct(item)
    setEditName(item.name || '')
    setEditCategory(item.category || '')
    setEditSubCategory(item.subCategory || '')
    setEditPrice(item.price || '')
    setEditBestSeller(item.bestSeller || false)
    const imgs = item.image || []
    setEditImages([imgs[0] || null, imgs[1] || null, imgs[2] || null, imgs[3] || null])
    setEditDescription(item.description || '')
    setEditStock(item.stock || 0)
    setEditAvailability(item.availability || calcAvailability(item.stock))
    setEditColors(item.colors || [])
    setEditModalOpen(true)
  }

  const calcAvailability = (stock) => {
    if (!stock || stock === 0) return 'Out of Stock'
    if (stock <= 10) return 'Low Stock'
    return 'Available'
  }

  const handleImageChange = (e, index) => {
    const file = e.target.files[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    const newImgs = [...editImages]
    newImgs[index] = preview
    setEditImages(newImgs)
  }

  const removeImage = (index) => {
    const newImgs = [...editImages]
    newImgs.splice(index, 1)
    newImgs.push(null)
    setEditImages(newImgs)
  }

  const toggleColor = (color) => {
    setEditColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    )
  }

  useEffect(() => {
    setEditAvailability(calcAvailability(Number(editStock)))
  }, [editStock])

  const updateProduct = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/update',
        {
          id: editProduct._id,
          name: editName,
          category: editCategory,
          subCategory: editSubCategory,
          price: editPrice,
          bestSeller: editBestSeller,
          description: editDescription,
          stock: editStock,
          availability: editAvailability,
          colors: editColors,
          image: editImages.filter(Boolean)
        },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Product updated')
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setEditModalOpen(false)
      setEditProduct(null)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const filteredList = list
    .filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter ? item.category === categoryFilter : true) &&
      (subCategoryFilter ? item.subCategory === subCategoryFilter : true)
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name)
      if (sortOrder === 'desc') return b.name.localeCompare(a.name)
      return 0
    })

  return (
    <div className="space-y-8">
      <p className="text-lg font-semibold">All Products List</p>

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-1 rounded"
        />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border px-3 py-1 rounded">
          <option value="">All Categories</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>
        <select value={subCategoryFilter} onChange={e => setSubCategoryFilter(e.target.value)} className="border px-3 py-1 rounded">
          <option value="">All Sub Categories</option>
          {subCategories.map((sc, i) => (
            <option key={i} value={sc}>{sc}</option>
          ))}
        </select>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="border px-3 py-1 rounded">
          <option value="">Sort</option>
          <option value="asc">A–Z</option>
          <option value="desc">Z–A</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm font-semibold">
          <div>ID</div><div>Image</div><div>Name</div><div>Category</div><div>SubCategory</div><div>Price</div><div className="text-center">Action</div>
        </div>
        {filteredList.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.5fr_1fr_3fr] md:grid-cols-[1.5fr_1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
          >
            <div className="truncate">{item._id}</div>
            <img className="w-12 h-12 object-cover rounded" src={(item.image && item.image[0]) || ''} alt="" />
            <div>{item.name}</div>
            <div>{item.category}</div>
            <div>{item.subCategory || '-'}</div>
            <div>{currency}{item.price}</div>
            <div className="flex gap-2 justify-end md:justify-center">
              <button onClick={() => openEditModal(item)} className="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
              <button onClick={() => openDeleteModal(item)} className="p-1 bg-red-500 text-white rounded">
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {removedList.length > 0 && (
        <div className="pt-8">
          <p className="text-lg font-semibold mb-2">Recently Removed Products</p>
          <div className="flex flex-col gap-2">
            <div className="hidden md:grid grid-cols-[1.5fr_1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm font-semibold">
              <div>ID</div><div>Image</div><div>Name</div><div>Category</div><div>SubCategory</div><div>Price</div><div className="text-center">Recover</div>
            </div>
            {removedList.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1.5fr_1fr_3fr] md:grid-cols-[1.5fr_1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
              >
                <div className="truncate">{item._id}</div>
                <img className="w-12 h-12 object-cover rounded" src={(item.image && item.image[0]) || ''} alt="" />
                <div>{item.name}</div>
                <div>{item.category}</div>
                <div>{item.subCategory || '-'}</div>
                <div>{currency}{item.price}</div>
                <div className="flex gap-2 justify-end md:justify-center">
                  <button
                    onClick={() => recoverProduct(item)}
                    className="p-1 bg-green-500 text-white rounded"
                  >
                    <RefreshCw size={16}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4">
            <p className="text-lg font-semibold text-center">Confirm Deletion</p>
            <p className="text-center">Type <span className="font-bold">{deleteProduct.name}</span> to confirm</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              className="border w-full px-3 py-2 rounded"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button
                onClick={removeProduct}
                disabled={deleteConfirmText !== deleteProduct.name}
                className={`px-4 py-2 rounded text-white ${deleteConfirmText === deleteProduct.name ? 'bg-red-600' : 'bg-red-300 cursor-not-allowed'}`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl space-y-4 relative">
            <div className="bg-green-600 text-white flex justify-between items-center px-6 py-3 rounded-t-lg">
              <h2 className="text-lg font-semibold">Edit Product</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-white text-2xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Upload / Replace Images</label>
                <div className="flex gap-3 flex-wrap">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                      {img ? (
                        <>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <label className="flex items-center justify-center w-full h-full cursor-pointer text-gray-400">
                          +
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleImageChange(e, idx)}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="border w-full px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="border w-full px-3 py-2 rounded"
                  rows="3"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="border w-full px-3 py-2 rounded"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Sub Category</label>
                  <select
                    value={editSubCategory}
                    onChange={e => setEditSubCategory(e.target.value)}
                    className="border w-full px-3 py-2 rounded"
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories.map((sc, i) => (
                      <option key={i} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    className="border w-full px-3 py-2 rounded [appearance:textfield]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={e => setEditStock(e.target.value)}
                    className="border w-full px-3 py-2 rounded [appearance:textfield]"
                  />
                  <p className={`mt-1 text-sm font-semibold ${
                    editAvailability === 'Available' ? 'text-green-600' :
                    editAvailability === 'Low Stock' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {editAvailability}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <p className="mb-2 font-medium">Product Colors</p>
                <div className="flex gap-3 flex-wrap">
                  {colorOptions.map((color) => {
                    const isSelected = editColors.includes(color)
                    return (
                      <div
                        key={color}
                        onClick={() => toggleColor(color)}
                        className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded transition-all duration-200 ${
                          isSelected ? 'ring-2 ring-offset-1 ring-green-500' : 'bg-slate-100'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                            isSelected ? 'border-green-500' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        ></span>
                        <p
                          className={`capitalize ${
                            isSelected ? 'font-semibold text-green-600' : 'text-gray-700'
                          }`}
                        >
                          {color}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editBestSeller}
                  onChange={e => setEditBestSeller(e.target.checked)}
                />
                <span>Add to Best Seller</span>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button onClick={updateProduct} className="px-4 py-2 bg-green-600 text-white rounded">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default List
