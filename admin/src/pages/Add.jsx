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
  const [category, setCategory] = useState('Equipment'); // default matches option
  const [subCategory, setSubCategory] = useState('Diagnostic Tools'); // default matches option
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [stock, setStock] = useState(0);
  const [availability, setAvailability] = useState('Out of Stock');

  // Update availability based on stock
  useEffect(() => {
    if (stock === 0) setAvailability('Out of Stock');
    else if (stock <= 10) setAvailability('Low Stock');
    else setAvailability('Available');
  }, [stock]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('stock', stock);
      formData.append('availability', availability);

      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);

      const response = await axios.post(
        backendUrl + '/api/product/add',
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        // reset form
        setName('');
        setDescription('');
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice('');
        setCategory('Equipment');
        setSubCategory('Diagnostic Tools');
        setSizes([]);
        setStock(0);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      {/* Image Upload */}
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2">
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

      {/* Name */}
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

      {/* Description */}
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

      {/* Category, Subcategory, Price */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product category</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="Equipment">Medical Equipment</option>
            <option value="Consumables">Medical Consumables</option>
            <option value="Peripherals">Health & Wellness Peripherals</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub category</p>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="Diagnostic Tools">Diagnostic Tools</option>
            <option value="Mobility Aids">Mobility Aids</option>
            <option value="Home Monitoring Devices">Home Monitoring Devices</option>
            <option value="Personal Protective Equipment">Personal Protective Equipment (PPE)</option>
            <option value="Wound Care Supplies">Wound Care Supplies</option>
            <option value="Injection & IV Supplies">Injection & IV Supplies</option>
            <option value="Respiratory Care">Respiratory Care</option>
            <option value="Diabetic Care">Diabetic Care</option>
            <option value="Physical Therapy Tools">Physical Therapy Tools</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px] no-spinner"
            type="number"
            placeholder="25"
          />
        </div>
      </div>

      {/* Stock & Availability */}
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

      {/* Colors */}
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
            );
          })}
        </div>
      </div>

      {/* Bestseller */}
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

      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white rounded">
        ADD
      </button>
    </form>
  );
};

export default Add;
