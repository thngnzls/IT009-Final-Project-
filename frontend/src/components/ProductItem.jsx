import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price }) => {

  const { currency } = useContext(ShopContext);

  return (
    <Link to={`/product/${id}`} onClick={() => window.scrollTo(0, 0)} className='text-gray-700 cursor-pointer'>

      <div className='w-full h-80 flex items-center justify-center overflow-hidden bg-white'>
        <img 
          className='h-full object-contain transition ease-in-out duration-300 hover:scale-110' 
          src={image[0]} 
          alt={name} 
        />
      </div>

      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <p className='text-sm font-medium'>{currency}{price}</p>
      
    </Link>
  );
}

export default ProductItem;
