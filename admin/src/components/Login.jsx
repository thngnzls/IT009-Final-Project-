import axios from 'axios'
import React, { useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Login = ({ setToken, onCreateAdminClick }) => { 

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    // 1. Add loading state
    const [isLoading, setIsLoading] = useState(false) 

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true); // 2. Start loading
        
        try {
            const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
            
            if (response.data.success) {
                setToken(response.data.token)
                // Clear inputs on success (optional)
                setEmail('');
                setPassword('');
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.error(error);
            // Use the backend's error message if available, otherwise fallback
            toast.error(error.response?.data?.message || 'Login failed. Please check your network or server.');
        } finally {
            setIsLoading(false); // 3. Stop loading
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center w-full'>
            <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
                <h1 className='text-2xl font-bold mb-4'>Admin Panel</h1>
                <form onSubmit={onSubmitHandler}>
                    <div className='mb-3 min-w-72'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                        <input onChange={(e) => setEmail(e.target.value)} value={email} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="email" placeholder='your@email.com' required disabled={isLoading} />
                    </div>
                    <div className='mb-3 min-w-72'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                        <input onChange={(e) => setPassword(e.target.value)} value={password} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="password" placeholder='Enter your password' required disabled={isLoading} />
                    </div>
                    {/* 4. Use loading state to disable and change button text */}
                    <button 
                        className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black hover:bg-gray-800 disabled:bg-gray-400' 
                        type="submit" 
                        disabled={isLoading}
                    > 
                        {isLoading ? 'Logging In...' : 'Login'} 
                    </button>
                </form>
                
                {/* Link to Create Admin Account */}
                <div className='mt-4 text-center'>
                    <span 
                        onClick={onCreateAdminClick} 
                        className='text-sm text-blue-600 hover:text-blue-800 cursor-pointer'
                    >
                        Create Admin Account
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Login