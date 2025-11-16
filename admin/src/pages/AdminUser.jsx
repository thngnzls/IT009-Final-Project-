"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { backendUrl } from "../App"
import { toast } from "react-toastify"

const AdminUser = ({ token }) => {
    const [users, setUsers] = useState([])
    const [editingUser, setEditingUser] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "", 
        email: "",
        role: "user",
        suspended: false,
    })
    const [showAddAdmin, setShowAddAdmin] = useState(false)
    const [addAdminData, setAddAdminData] = useState({
        name: "",
        email: "",
        password: "",
        role: "admin",
    })

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await axios.get(backendUrl + "/api/user/all", {
                headers: { token },
            })
            if (response.data.users) {
                setUsers(response.data.users ? response.data.users.reverse() : []);
            } else {
                toast.error("Failed to fetch users")
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    // Remove user/admin
    const removeUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) return
        try {
            setIsLoading(true)
            const response = await axios.delete(backendUrl + `/api/user/${id}`, {
                headers: { token },
            })
            if (response.data.message) {
                toast.success(response.data.message)
                await fetchUsers()
            } else {
                toast.error("Failed to delete admin")
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Suspend/Unsuspend user
    const toggleSuspend = async (user) => {
        try {
            setIsLoading(true)
            const response = await axios.put(
                backendUrl + `/api/user/${user._id}`,
                { 
                    firstName: user.firstName, 
                    lastName: user.lastName, 
                    email: user.email,
                    role: user.role,
                    suspended: !user.suspended 
                },
                { headers: { token } }
            )
            if (response.data.success) {
                toast.success(`User ${!user.suspended ? "suspended" : "unsuspended"} successfully`)
                await fetchUsers()
            } else {
                toast.error(response.data.message || "Failed to update suspension")
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Open edit modal
    const openEditModal = (user) => {
        setEditingUser(user)
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
        setFormData({
            name: fullName,
            email: user.email || "",
            role: user.role || "user",
            suspended: user.suspended || false,
        })
    }

    // Close edit modal
    const closeEditModal = () => {
        setEditingUser(null)
        setFormData({ name: "", email: "", role: "user", suspended: false })
    }

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    // Update user
    const updateUser = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        
        const nameParts = formData.name.trim().split(/\s+/)
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(" ") || ""
        
        try {
            const response = await axios.put(
                backendUrl + `/api/user/${editingUser._id}`,
                { 
                    ...formData,
                    firstName,
                    lastName,
                    name: undefined
                },
                { headers: { token } }
            )
            if (response.data.success) {
                toast.success("User updated successfully")
                closeEditModal()
                await fetchUsers()
            } else {
                toast.error(response.data.message || "Update failed")
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle add admin input
    const handleAddAdminChange = (e) => {
        const { name, value } = e.target
        setAddAdminData((prev) => ({ ...prev, [name]: value }))
    }

    // Add new admin
    const addAdmin = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        const nameParts = addAdminData.name.trim().split(/\s+/)
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(" ") || ""
        
        try {
            const response = await axios.post(
                backendUrl + "/api/user/register-admin",
                {
                    firstName,
                    lastName,
                    email: addAdminData.email,
                    password: addAdminData.password,
                    role: addAdminData.role
                },
                { headers: { token } } 
            )
            if (response.data.success) {
                toast.success("Admin added successfully")
                setShowAddAdmin(false)
                setAddAdminData({ name: "", email: "", password: "", role: "admin" })
                await fetchUsers()
            } else {
                toast.error(response.data.message || "Failed to add admin")
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <>
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-2xl font-bold mb-6">Admin Account</h3>
                <button
                    className="px-4 py-2 bg-black text-white rounded text-sm"
                    onClick={() => setShowAddAdmin(true)}
                >
                    Add Admin
                </button>
            </div>

            <div className="flex flex-col gap-2">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-[2fr_3fr_2fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm font-semibold">
                    <b>Name</b>
                    <b>Email</b>
                    <b>Role</b>
                    <b>Status</b>
                    <b className="text-center">Action</b>
                </div>

                {/* Admin List Only */}
                {users
                    .filter((user) => user.role === "admin") // ✅ Show only admins
                    .map((user, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-[2fr_3fr] md:grid-cols-[2fr_3fr_2fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
                        >
                            <p>{user.firstName} {user.lastName}</p> 
                            <p>{user.email}</p>
                            <p>{user.role}</p>
                            <p>
                                {user.suspended ? (
                                    <span className="text-red-500 font-semibold">Suspended</span>
                                ) : (
                                    <span className="text-green-600 font-semibold">Active</span>
                                )}
                            </p>
                            <div className="flex justify-end md:justify-center gap-3">
                                <span
                                    onClick={() => openEditModal(user)}
                                    className="cursor-pointer text-blue-500"
                                >
                                    EDIT
                                </span>
                                <span
                                    onClick={() => removeUser(user._id)}
                                    className="cursor-pointer text-red-500"
                                >
                                    DELETE
                                </span>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="font-semibold text-lg mb-4">Edit Admin</h3>
                        <form onSubmit={updateUser} className="flex flex-col gap-3">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Full Name"
                                className="border p-2 rounded"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                className="border p-2 rounded"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white py-2 rounded mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Updating..." : "Update Admin"}
                            </button>
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="mt-2 bg-gray-300 text-black py-2 rounded"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Admin Modal */}
            {showAddAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="font-semibold text-lg mb-4">Add Admin</h3>
                        <form onSubmit={addAdmin} className="flex flex-col gap-3">
                            <input
                                type="text"
                                name="name"
                                value={addAdminData.name}
                                onChange={handleAddAdminChange}
                                placeholder="Full Name"
                                className="border p-2 rounded"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={addAdminData.email}
                                onChange={handleAddAdminChange}
                                placeholder="Email"
                                className="border p-2 rounded"
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                value={addAdminData.password}
                                onChange={handleAddAdminChange}
                                placeholder="Password"
                                className="border p-2 rounded"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-black text-white py-2 rounded mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Adding..." : "Add Admin"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddAdmin(false)}
                                className="mt-2 bg-gray-300 text-black py-2 rounded"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default AdminUser
