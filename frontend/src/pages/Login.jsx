"use client"

import { useContext, useEffect, useState } from "react"
import { ShopContext } from "../context/ShopContext"
import axios from "axios"
import { toast } from "react-toastify"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const Login = () => {
  const [currentState, setCurrentState] = useState("Login")
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [username, setUsername] = useState("")
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.endsWith(".com")
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^0\d{10}$/ 
    return phoneRegex.test(phone)
  }

  const validateInputs = () => {
    const newErrors = {}

    if (currentState === "Sign Up") {
      if (!firstName.trim()) newErrors.firstName = "First name is required."
      if (!lastName.trim()) newErrors.lastName = "Last name is required."
      if (!username.trim()) newErrors.username = "Username is required."
      if (!validateEmail(email)) newErrors.email = "Please enter a valid email address ending with .com."
      if (password.length < 6) newErrors.password = "Password must be at least 8 characters."
      if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match."
      if (!validatePhone(phone)) newErrors.phone = "Phone number must start with 09 and be 11 digits."
      if (!address.trim()) newErrors.address = "Address is required."
    } else {
      if (!email.trim()) newErrors.email = "Email is required."
      if (!validateEmail(email)) newErrors.email = "Please enter a valid email address ending with .com."
      if (!password) newErrors.password = "Password is required."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    const isValid = validateInputs()
    if (!isValid) {
      for (const key in errors) {
        toast.error(errors[key])
      }
      return
    }

    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/user/register", {
          firstName,
          lastName,
          email,
          password,
          address,
          phone,
          username,
        })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem("token", response.data.token)
          toast.success("Account created successfully! Welcome, " + firstName + "!")
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(backendUrl + "/api/user/login", { email, password })
        if (response.data.success) {

          // const otpRawr = '111111';

          // if (response.data.toVerify === true) {
          //   const response = await axios.post(backendUrl + "/api/user/send-verification", { email, otpRawr });
          //   console.log(response.data.token);
          //   return;
          // }

          setToken(response.data.token)
          localStorage.setItem("token", response.data.token)
          toast.success("Login successful! Welcome, " + response.data.firstName + "!")

        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred. Please try again.")
    }
  }

  useEffect(() => {
    if (token) {
      navigate("/")
    }
  }, [token, navigate])

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-[90%] sm:max-w-xl m-auto gap-4 p-8 bg-white rounded-lg shadow-md text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-4 self-center">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Login" ? (
        <>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Email"
            required
          />
          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600 pr-10"
              placeholder="Password"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="First Name"
              required
            />
            <input
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Last Name"
              required
            />
          </div>
          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Username"
            required
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Email"
            required
          />
          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600 pr-10"
              placeholder="Password"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="relative">
            <input
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              type={showConfirmPassword ? "text" : "password"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600 pr-10"
              placeholder="Confirm Password"
              required
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          <input
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "")
              setPhone(value)
              if (value && !validatePhone(value)) {
                setErrors((prev) => ({ ...prev, phone: "Phone number must start with 0 and be exactly 11 digits." }))
              } else {
                setErrors((prev) => {
                  const { phone, ...rest } = prev
                  return rest
                })
              }
            }}
            value={phone}
            type="text"
            maxLength="11"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600"
            placeholder="Phone Number"
            required
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          <textarea
            onChange={(e) => setAddress(e.target.value)}
            value={address}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600 resize-none"
            placeholder="Address"
            rows="3"
            required
          />
        </>
      )}

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        {currentState === "Login" ? (
          <p onClick={() => setCurrentState("Sign Up")} className="cursor-pointer text-gray-600 hover:underline">
            Create account
          </p>
        ) : (
          <p onClick={() => setCurrentState("Login")} className="cursor-pointer text-gray-600 hover:underline">
            Login Here
          </p>
        )}
      </div>
      <button className="bg-green-600 text-white font-light px-8 py-2 mt-4 rounded-md hover:bg-green-700 transition-colors">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  )
}

export default Login