// src/App.jsx
import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Inventory from './pages/Inventory'
import Login from './components/Login'
import User from './pages/AdminUser'
import CustomerData from './pages/CustomerData'
import SalesAnalytics from './pages/SalesAnalytics'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// 1. Import the new CreateAdmin component
import CreateAdmin from './components/AddAdmin' // Assuming you placed it in components/CreateAdmin.jsx

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '₱'

const App = () => {

    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
    // 2. State to toggle between Login and CreateAdmin
    const [showCreateAdmin, setShowCreateAdmin] = useState(false); 

    useEffect(() => {
        localStorage.setItem('token', token)
        // If a token is set, we assume the user is logged in and hide the registration form.
        if (token) {
            setShowCreateAdmin(false);
        }
    }, [token])

    // Function to switch to the Login form from the CreateAdmin form
    const navigateToLogin = () => {
        setShowCreateAdmin(false);
    }

    // Function to switch to the CreateAdmin form from the Login form
    const navigateToCreateAdmin = () => {
        setShowCreateAdmin(true);
    }

    // Function to handle successful creation/login from CreateAdmin (optional, but good practice)
    const handleAdminCreationSuccess = (newToken) => {
        setToken(newToken);
        // The useEffect hook handles setting showCreateAdmin to false when token is set.
    }


    const AuthView = () => {
        if (showCreateAdmin) {
            return <CreateAdmin setToken={setToken} onLoginClick={navigateToLogin} />;
        } else {
            // 3. Pass the handler to the Login component
            return <Login setToken={setToken} onCreateAdminClick={navigateToCreateAdmin} />;
        }
    }

    return (
        <div className='bg-gray-50 min-h-screen'>
            <ToastContainer />
            {/* 4. Conditionally render the AuthView */}
            {token === ""
                ? <AuthView />
                : <>
                    <Navbar setToken={setToken} />
                    <hr />
                    <div className='flex w-full'>
                        <Sidebar />
                        <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
                            <Routes>
                                <Route path='/' element={<List token={token} />} /> {/* Added default route */}
                                <Route path='/add' element={<Add token={token} />} />
                                <Route path='/list' element={<List token={token} />} />
                                <Route path='/orders' element={<Orders token={token} />} />
                                <Route path='/inventory' element={<Inventory token={token} />} />
                                <Route path='/user' element={<User token={token} />} />
                                <Route path='/customer-data' element={<CustomerData token={token} />} />
                                <Route path='/sales-analytics' element={<SalesAnalytics token={token} />} />
                            </Routes>
                        </div>
                    </div>
                </>
            }
        </div>
    )
}

export default App