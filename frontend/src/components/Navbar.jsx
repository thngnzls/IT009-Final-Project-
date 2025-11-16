// src/components/Navbar.jsx (Customer Facing)

"use client"

import { useContext, useState, useEffect } from "react"
import { assets } from "../assets/assets"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { ShopContext } from "../context/ShopContext" 
import { FaUserCircle } from "react-icons/fa"
import { FaHeart } from "react-icons/fa"
import axios from 'axios'

// 🚨 IMPORT THE NOTIFICATION BELL
import NotificationBell from './NotificationBell'; 

const Navbar = () => {
    const [visible, setVisible] = useState(false)
    const [showGame, setShowGame] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [feedback, setFeedback] = useState("")
    const [score, setScore] = useState(0)
    const [finished, setFinished] = useState(false)

    const navigate = useNavigate()
    const { setShowSearch, getCartCount, token, setToken, setCartItems, getWishlistCount, userName, setUserName, backendUrl } = useContext(ShopContext)

    // ✅ Plant quiz data (kept as original)
    const quizData = [
        { plant: "Pansit-pansitan", correct: "Peperomia pellucida", options: ["Peperomia pellucida", "Basella alba", "Ipomoea aquatica"] },
        // ... (rest of quizData)
        { plant: "Akapulo", correct: "Senna alata", options: ["Senna alata", "Peperomia pellucida", "Hibiscus"] }
    ]

    
    useEffect(() => {
        const fetchUserData = async () => {
            if (token && backendUrl) {
                try {
                    const response = await axios.get(backendUrl + "/api/user/get-user-data", { headers: { token } })
                    
                    if (response.data.success) {

                        const userFirstName = response.data.user?.firstName; 
                        
                        if (userFirstName) {
                            // Fixed: Using userFirstName to set the state
                            setUserName(userFirstName); 
                        } else {
                            setUserName("User"); 
                        }
                    } else {
                        console.error("Failed to fetch user data:", response.data.message)
                        setUserName("")
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error)
                    setUserName("")
                }
            }
        }
        fetchUserData()
    }, [token, backendUrl, setUserName])

    const logout = () => {
        navigate("/login")
        localStorage.removeItem("token")
        setToken("")
        setCartItems({})
        setUserName("")
    }

    // ... (handleAnswer, resetGame, HeartIcon functions remain the same)

    const handleAnswer = (option) => {
        if (finished) return

        const current = quizData[currentQuestion]
        if (option === current.correct) {
            setFeedback("✅ Correct!")
            setScore(score + 1)
        } else {
            setFeedback("❌ Wrong! The correct answer is " + current.correct)
        }

        setTimeout(() => {
            setFeedback("")
            if (currentQuestion + 1 < quizData.length) {
                setCurrentQuestion((prev) => prev + 1)
            } else {
                setFinished(true)
            }
        }, 2000)
    }

    const resetGame = () => {
        setScore(0)
        setCurrentQuestion(0)
        setFeedback("")
        setFinished(false)
    }

    const HeartIcon = ({ className }) => <FaHeart className={className} />


    return (
        <div className="flex items-center justify-between py-5 font-medium">
            <Link to="/">
                <img src={assets.logo || "/placeholder.svg"} className="w-36" alt="Logo" />
            </Link>

            <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
                <NavLink to="/" className={getNavLinkClass}>HOME</NavLink>
                <NavLink to="/collection" className={getNavLinkClass}>SEED</NavLink>
                <NavLink to="/about" className={getNavLinkClass}>ABOUT</NavLink>
                <NavLink to="/contact" className={getNavLinkClass}>CONTACT</NavLink>
            </ul>

            <div className="flex items-center gap-6">
                
                {/* 🔍 Search */}
                <img
                    onClick={() => {
                        setShowSearch(true)
                        navigate("/collection")
                    }}
                    src={assets.search_icon || "/placeholder.svg"}
                    className="w-5 cursor-pointer"
                    alt="Search icon"
                />

                {/* 👤 User */}
                <div className="group relative flex items-center gap-2">
                    {token ? (
                        <>
                            <FaUserCircle className="w-5 h-5 text-gray-700 cursor-pointer" />
                            <p className="hidden md:block text-sm">Welcome, {userName}!</p>
                        </>
                    ) : (
                        <img
                            onClick={() => navigate("/login")}
                            className="w-5 cursor-pointer"
                            src={assets.profile_icon || "/placeholder.svg"}
                            alt="Profile icon"
                        />
                    )}
                    {token && (
                        <div className="group-hover:block hidden absolute dropdown-menu right-0 top-full pt-4 z-10">
                            <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded shadow-lg">
                                <p onClick={() => navigate("/profile")} className="cursor-pointer hover:text-black">My Profile</p>
                                <p onClick={() => navigate("/orders")} className="cursor-pointer hover:text-black">Orders</p>
                                <p onClick={logout} className="cursor-pointer hover:text-black">Logout</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 🔔 NOTIFICATION BELL - Displayed only if the user is logged in */}
                {token && <NotificationBell />} 


                {/* ❤️ Wishlist */}
                <Link to="/wishlist" className="relative group">
                    <HeartIcon className="w-5 h-5 cursor-pointer transition-colors text-gray-700 hover:text-red-500" />
                    {getWishlistCount() > 0 && (
                        <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-red-500 text-white aspect-square rounded-full text-[8px]">
                            {getWishlistCount()}
                        </p>
                    )}
                </Link>

                {/* 🛒 Cart */}
                <Link to="/cart" className="relative">
                    <img src={assets.cart_icon || "/placeholder.svg"} className="w-5 min-w-5" alt="Cart icon" />
                    <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                        {getCartCount()}
                    </p>
                </Link>

                {/* 🎮 Game toggle */}
               <button
                    onClick={() => setShowGame(!showGame)}
                    className="flex items-center gap-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M6 8c-1.66 0-3 1.34-3 3v4c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5v-4c0-1.66-1.34-3-3-3H6zm0 2h12c.55 0 1 .45 1 1v4c0 1.65-1.35 3-3 3H8c-1.65 0-3-1.35-3-3v-4c0-.55.45-1 1-1zm4 1c-.55 0-1 .45-1 1v1H8c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1-.45 1-1s-.45-1-1-1h-1v-1c0-.55-.45-1-1-1zm6.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-3 2a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    {showGame ? "Close" : "Play"}
                </button>
            </div>

            {/* 🎮 Game modal (remains the same) */}
            {showGame && (
                <div className="absolute top-20 right-5 bg-white border rounded-lg shadow-lg p-4 w-64 z-20">
                    {!finished ? (
                        <>
                            <h3 className="font-bold mb-2 text-center">Guess the Scientific Name🌱</h3>
                            <p className="text-sm mb-3">What is the scientific name of <span className="font-semibold">{quizData[currentQuestion].plant}</span>?</p>
                            <div className="flex flex-col gap-2">
                                {quizData[currentQuestion].options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(opt)}
                                        className="border px-2 py-1 rounded hover:bg-green-100 text-sm"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {feedback && <p className="mt-3 text-center font-medium">{feedback}</p>}
                        </>
                    ) : (
                        <div className="text-center">
                            <h3 className="font-bold mb-2">🎉 Quiz Finished!</h3>
                            <p className="mb-2">Your Score: <b>{score}</b> / {quizData.length}</p>
                            <button
                                onClick={resetGame}
                                className="px-3 py-1 mt-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Play Again
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const getNavLinkClass = ({ isActive }) =>
    `transition-colors duration-200 ${isActive 
    ? "text-green-600 border-b-2 border-green-600 pb-1" 
    : "hover:text-green-600"}`; 
                                
export default Navbar