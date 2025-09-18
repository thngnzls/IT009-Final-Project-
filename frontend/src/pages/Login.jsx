// src/pages/Login.jsx
import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  // basic auth fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPasword] = useState('');

  //for signup
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === 'Sign Up') {
        const payload = {
          email,
          password,
          firstName,
          lastName,
          street,
          city,
          state: stateName,
          zipcode,
          country,
          phone
        };

        const response = await axios.post(`${backendUrl}/api/user/register`, payload);
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success("Account created — logged in");
          navigate('/');
        } else {
          toast.error(response.data.message || "Sign up failed");
        }
      } else {
        const response = await axios.post(`${backendUrl}/api/user/login`, { email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success("Logged in");
          navigate('/');
        } else {
          toast.error(response.data.message || "Login failed");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token]);

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {currentState === 'Sign Up' && (
        <>
          <div className='w-full flex gap-2'>
            <input onChange={(e) => setFirstName(e.target.value)} value={firstName} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='First name' required />
            <input onChange={(e) => setLastName(e.target.value)} value={lastName} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Last name' required />
          </div>
          <input onChange={(e) => setStreet(e.target.value)} value={street} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Street' required />
          <div className='w-full flex gap-2'>
            <input onChange={(e) => setCity(e.target.value)} value={city} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='City' required />
            <input onChange={(e) => setStateName(e.target.value)} value={stateName} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='State' />
          </div>
          <div className='w-full flex gap-2'>
            <input onChange={(e) => setZipcode(e.target.value)} value={zipcode} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Zipcode' required />
            <input onChange={(e) => setCountry(e.target.value)} value={country} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Country' required />
          </div>
          <input onChange={(e) => setPhone(e.target.value)} value={phone} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Phone' required />
        </>
      )}

      <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email' required />
      <input onChange={(e) => setPasword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-gray-800' placeholder='Password' required />

      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className=' cursor-pointer'>Forgot your password?</p>
        {
          currentState === 'Login'
            ? <p onClick={() => setCurrentState('Sign Up')} className=' cursor-pointer'>Create account</p>
            : <p onClick={() => setCurrentState('Login')} className=' cursor-pointer'>Login Here</p>
        }
      </div>
      <button className='bg-black text-white font-light px-8 py-2 mt-4'>{currentState === 'Login' ? 'Sign In' : 'Sign Up'}</button>
    </form>
  );
};

export default Login;
