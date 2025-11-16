import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import '../App.css';

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  // ✅ Using categories from OLD file
  const [category, setCategory] = useState('Flower'); 
  // ✅ Using subcategories from OLD file
  const [subCategory, setSubCategory] = useState('Indoor'); 
  
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]); // This is the "colors" from your new file
  const [stock, setStock] = useState(0);
  const [availability, setAvailability] = useState('Out of Stock');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (stock === 0) setAvailability('Out of Stock');
    else if (stock <= 10) setAvailability('Low Stock');
    else setAvailability('Available');
  }, [stock]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !price || stock === '') {
      toast.error('Please fill in all required fields.');
      return;
    }
    // Note: This logic was for "product colors" in your new file.
    // If you want to make it optional, remove this check.
    if (sizes.length === 0) {
      toast.error('Select at least one product color.');
      return;
    }
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes)); // 'sizes' holds the colors
      formData.append('stock', stock);
      formData.append('availability', availability);
      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);
      const response = await axios.post(backendUrl + '/api/product/add', formData, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice('');
        // ✅ Reset to OLD file's default category
        setCategory('Flower'); 
        // ✅ Reset to OLD file's default subcategory
        setSubCategory('Indoor'); 
        setSizes([]);
        setStock(0);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setShowModal(false);
  };

  const previewImages = [image1, image2, image3, image4].filter(Boolean).map((img, i) => (
    <img key={i} src={URL.createObjectURL(img)} alt="" className="w-24 h-24 object-cover rounded border" />
  ));

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col w-full items-start gap-3">
        <div>
          <p className="mb-2">Upload Image</p>
          <div className="flex gap-2">
            {/* Using the cleaner image upload logic from NEW file */}
            {[image1, image2, image3, image4].map((img, index) => (
              <label key={index} htmlFor={`image${index + 1}`}>
                <img
                  className="w-20"
                  src={!img ? assets.upload_area : URL.createObjectURL(img)}
                  alt=""
                />
                <input
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (index === 0) setImage1(file);
                    if (index === 1) setImage2(file);
                    if (index === 2) setImage3(file);
                    if (index === 3) setImage4(file);
                  }}
                  type="file"
                  id={`image${index + 1}`}
                  hidden
                />
              </label>
            ))}
          </div>
        </div>
        <div className="w-full">
          <p className="mb-2">Product name</p>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full max-w-[500px] px-3 py-2"
            type="text"
            placeholder="Type here"
            required
          />
        </div>
        <div className="w-full">
          <p className="mb-2">Product description</p>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="w-full max-w-[500px] px-3 py-2"
            placeholder="Write content here"
            required
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
          
          {/* ✅ START: Categories from OLD file */}
          <div>
            <p className="mb-2">Product category</p>
            <select
              value={category} // Kept value prop from new file for controlled component
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2"
            >
              <option value="Flower">Flowers and Ornaments</option>
              <option value="House">Indoor / Houseplant</option>
              <option value="Fruit">Fruits</option>
              <option value="Vegetable">Vegetables</option>
              <option value="Herbs">Herbs</option>
            </select>
          </div>
          <div>
            <p className="mb-2">Sub category</p>
            <select
              value={subCategory} // Kept value prop from new file
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-3 py-2"
            >
              <option value="Rainy">Rainy / Wet Environment</option>
              <option value="Dry">Dry Environment</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Indoor">Indoor</option>
            </select>
          </div>
          {/* ✅ END: Categories from OLD file */}

          <div>
            <p className="mb-2">Product Price</p>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              className="w-full px-3 py-2 sm:w-[120px] no-spinner"
              type="number"
              placeholder="25"
              // Removed 'required' from price to allow custom validation
            />
          </div>
        </div>
        
        {/* Keeping Stock/Availability logic from NEW file */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:items-center">
          <div>
            <p className="mb-2">Stock Quantity</p>
            <input
              type="number"
              className="px-3 py-2 w-full sm:w-[120px] no-spinner"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              min={0}
            />
          </div>
          <div>
            <p className="mb-2">Availability</p>
            <input
              type="text"
              className={`px-3 py-2 w-full sm:w-[150px] text-white font-semibold rounded ${
                availability === 'Out of Stock'
                  ? 'bg-red-500'
                  : availability === 'Low Stock'
                  ? 'bg-yellow-500'
                  : 'bg-green-600'
              }`}
              value={availability}
              disabled
            />
          </div>
        </div>
        
        {/* Keeping Color/Sizes logic from NEW file */}
        <div className="mt-2">
          <p className="mb-2 font-medium">Product Colors</p>
          <div className="flex gap-3">
            {['green', 'black', 'white', 'gray'].map((color) => {
              const isSelected = sizes.includes(color);
              return (
                <div
                  key={color}
                  onClick={() =>
                    setSizes((prev) =>
                      isSelected ? prev.filter((item) => item !== color) : [...prev, color]
                    )
                  }
                  className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-offset-1 ring-green-500' : 'bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                      isSelected ? 'border-green-500' : 'border-gray-300'
                    }`}
            _       style={{ backgroundColor: color }}
                  ></span>
                  <p
                    className={`capitalize ${
                      isSelected ? 'font-semibold text-green-600' : 'text-gray-700'
                    }`}
                  >
                    {color}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <input
            onChange={() => setBestseller((prev) => !prev)}
            checked={bestseller}
            type="checkbox"
            id="bestseller"
          />
          <label className="cursor-pointer" htmlFor="bestseller">
            Add to bestseller
          </label>
        </div>
        
        {/* Keeping the button style from your NEW file (which matches the OLD file's color) */}
        <button type="submit" className="w-28 py-3 mt-4 bg-black text-white rounded">
          ADD
        </button>
      </form>

      {/* Keeping the confirmation modal from NEW file */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b-4 border-green-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">Confirm Product Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4 text-gray-700 text-sm">
              {previewImages.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">{previewImages}</div>
              )}
              <p><span className="font-semibold">Name:</span> {name}</p>
              <p><span className="font-semibold">Description:</span> {description}</p>
              <p><span className="font-semibold">Category:</span> {category} | <span className="font-semibold">Sub:</span> {subCategory}</p>
              <p><span className="font-semibold">Price:</span> ₱{price}</p>
              <p><span className="font-semibold">Stock:</span> {stock} | <span className="font-semibold">Availability:</span> {availability}</p>
              <p><span className="font-semibold">Colors:</span> {sizes.join(', ') || 'None'}</p>
              <p><span className="font-semibold">Bestseller:</span> {bestseller ? 'Yes' : 'No'}</p>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm
        _     </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Add;