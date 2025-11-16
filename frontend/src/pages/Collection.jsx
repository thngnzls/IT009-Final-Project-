"use client"

import { useContext, useEffect, useState, useMemo } from "react"
import { ShopContext } from "../context/ShopContext"
import { assets } from "../assets/assets"
import Title from "../components/Title"
import ProductItem from "../components/ProductItem"
// REMOVED: import { ChevronDown, Filter, X } from 'lucide-react';

const categoriesList = [
  { value: "Flower", label: "Flower and Ornaments" },
  { value: "House", label: "Houseplants" },
  { value: "Fruit", label: "Fruits" },
  { value: "Vegetable", label: "Vegetables" },
  { value: "Herbs", label: "Herbs" },
];

const subCategoriesList = [
  { value: "Rainy", label: "Rainy / Wet Environment" },
  { value: "Dry", label: "Dry Environment" },
  { value: "Outdoor", label: "Outdoor" },
  { value: "Indoor", label: "Indoor" },
];

const Collection = () => {
  const { products, search, showSearch, wishlistItems, addToWishlist, removeFromWishlist, getWishlistCount, addToCart } =
    useContext(ShopContext)
  const [showFilter, setShowFilter] = useState(false)
  const [filterProducts, setFilterProducts] = useState([])
  const [category, setCategory] = useState([])
  const [subCategory, setSubCategory] = useState([])
  const [sortType, setSortType] = useState("relavent")

  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) => 
      prev.includes(value) 
        ? prev.filter((item) => item !== value) 
        : [...prev, value]
    )
  }

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) => 
      prev.includes(value) 
        ? prev.filter((item) => item !== value) 
        : [...prev, value]
    )
  }

  const applyFilter = () => {
    let productsCopy = products.slice()

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category))
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory))
    }

    setFilterProducts(productsCopy)
  }

  const sortProduct = () => {
    // Sort on the currently filtered list
    const fpCopy = filterProducts.slice() 

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price))
        break

      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price))
        break

      default:
        // Reset to filtered order (re-apply filter to reset any temporary sort)
        applyFilter() 
        break
    }
  }

  // Clear all filters function
  const clearAllFilters = () => {
    setCategory([])
    setSubCategory([])
    setSortType("relavent")
  }

  useEffect(() => {
    if (products.length > 0) {
      applyFilter()
    }
  }, [category, subCategory, search, showSearch, products])

  useEffect(() => {
    sortProduct()
  }, [sortType, products]) 
  
  // Re-sort when filterProducts changes (as a result of applyFilter)
  useEffect(() => {
    sortProduct(); 
  }, [filterProducts.length, category.length, subCategory.length]);


  // *** MODIFIED FUNCTION: Only calls addToCart; toast is handled in ShopContext ***
  const handleAddToCart = (itemId) => {
      addToCart(itemId);
  }
  

  // Show loading state if products are not loaded yet
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
        <div className="min-w-60">
          <p className="my-2 text-xl">FILTERS</p>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-base sm:text-2xl mb-4">
            <Title text1={"ALL"} text2={"COLLECTIONS"} />
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Helper Component for Checkbox (for cleaner render function)
  const FilterCheckbox = ({ value, label, checked, onChange }) => (
    <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:text-green-600 transition-colors">
      <input
        className="form-checkbox h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        value={value}
        checked={checked}
        onChange={onChange}
        type="checkbox"
      />
      <span className="font-light">{label}</span>
    </label>
  );


  return (
    <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 pt-10 border-t">
      
      {/* Filter Options (Left Column) */}
      <div className="sm:min-w-60 sm:max-w-60">
        
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setShowFilter(!showFilter)} 
          className="w-full sm:hidden flex justify-between items-center px-4 py-2 mb-4 text-lg font-semibold text-gray-800 bg-gray-100 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2">
            {/* Filter Icon Placeholder (using simple SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            FILTERS
          </div>
          {/* Chevron Icon Placeholder */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 transform transition-transform ${showFilter ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {/* Filters Container */}
        <div className={`${showFilter ? "block" : "hidden"} sm:block space-y-6`}>
            
            {/* Clear Filters Button */}
            {(category.length > 0 || subCategory.length > 0 || sortType !== "relavent") && (
                <button
                    onClick={clearAllFilters}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors border border-red-200"
                >
                    {/* X Icon Placeholder (using simple SVG) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg> 
                    Clear All Filters
                </button>
            )}

            {/* Category Filter - Clean Style */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="mb-4 text-sm font-semibold text-gray-800 border-b pb-2">CATEGORIES</p>
                <div className="flex flex-col space-y-2">
                    {categoriesList.map(item => (
                        <FilterCheckbox
                            key={item.value}
                            value={item.value}
                            label={item.label}
                            checked={category.includes(item.value)}
                            onChange={toggleCategory}
                        />
                    ))}
                </div>
            </div>

            {/* Sub Category Filter - Clean Style */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="mb-4 text-sm font-semibold text-gray-800 border-b pb-2">TYPE</p>
                <div className="flex flex-col space-y-2">
                    {subCategoriesList.map(item => (
                        <FilterCheckbox
                            key={item.value}
                            value={item.value}
                            label={item.label}
                            checked={subCategory.includes(item.value)}
                            onChange={toggleSubCategory}
                        />
                    ))}
                </div>
            </div>

        </div>
      </div>

      {/* Right Side (Products) */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
          
          {/* Product Sort - Clean Style */}
          <div className="relative">
            <select 
              value={sortType}
              onChange={(e) => setSortType(e.target.value)} 
              className="appearance-none block w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm font-medium transition-all cursor-pointer"
            >
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Sort by: Price Low to High</option>
              <option value="high-low">Sort by: Price High to Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                {/* Chevron Icon Placeholder */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        {/* Map Products */}
        {filterProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-8">
            {filterProducts.map((item, index) => (
              <ProductItem
                key={item._id || index}
                name={item.name}
                id={item._id}
                price={item.price}
                image={item.image}
                stock={item.stock}
                addToCart={() => handleAddToCart(item._id)}
              />
            ))}
          </div>

        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg mt-8 border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection