"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [action, setAction] = useState("");
  const [value, setValue] = useState("");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users");
        console.log("API Response:", response.data); // Debug log

        if (response.data && response.data.success) {
          setUsers(response.data.data || []); // Fallback to empty array if data is undefined
        } else if (response.data && response.data.message) {
          toast.error(response.data.message);
        } else {
          toast.error("Unexpected response from server");
        }
      } catch (error) {
        console.error("Fetch error:", error.response || error); // Debug error
        toast.error("Failed to fetch users: " + (error.response?.data?.message || error.message));
      }
    };
    fetchUsers();
  }, []);

  // Handle user actions (change password, update phone)
  const handleAction = async (e) => {
    e.preventDefault();
    if (!selectedUser || !action) {
      toast.error("Please select a user and action");
      return;
    }

    try {
      const response = await axios.put("/api/users", {
        userId: selectedUser._id,
        action,
        value,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setValue("");
        // Refresh users list
        const updatedResponse = await axios.get("/api/users");
        setUsers(updatedResponse.data.data || []);
        setSelectedUser(null); // Close the form after action
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update user: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle delete
  const handleDelete = async (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete("/api/users", {
          data: { userId },
        });
        if (response.data.success) {
          toast.success(response.data.message);
          setUsers(users.filter((user) => user._id !== userId));
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Failed to delete user: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // Handle block/unblock toggle
  const handleBlockToggle = async (user) => {
    try {
      const newBlockStatus = !user.isBlocked;
      const response = await axios.put("/api/users", {
        userId: user._id,
        action: "block",
        value: newBlockStatus.toString(),
      });
      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh users list
        const updatedResponse = await axios.get("/api/users");
        setUsers(updatedResponse.data.data || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update block status: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold text-gold-600 mb-6">Manage Users</h1>

      {/* Users Table */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        {users.length === 0 ? (
          <p className="text-gold-600">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gold-600">
              <thead>
                <tr className="bg-gold-100">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone Number</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gold-200">
                    <td className="p-3">{user.name || "N/A"}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.phoneNumber || "Not set"}</td>
                    <td className="p-3">
                      {user.isBlocked ? (
                        <span className="text-red-500">Blocked</span>
                      ) : (
                        <span className="text-green-500">Active</span>
                      )}
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => handleBlockToggle(user)}
                        className={`px-3 py-1 rounded text-white ${
                          user.isBlocked
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-gold-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Form */}
      {selectedUser && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gold-600 mb-4">
            Editing: {selectedUser.name || selectedUser.email}
          </h2>
          <form onSubmit={handleAction} className="space-y-4">
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
            >
              <option value="">Select Action</option>
              <option value="changePassword">Change Password</option>
              <option value="updatePhone">Update Phone Number</option>
            </select>
            <input
              type={action === "changePassword" ? "password" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                action === "changePassword" ? "New Password" : "Phone Number"
              }
              className="w-full p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
            />
            <button
              type="submit"
              className="w-full py-2 bg-gold-600 text-white font-medium rounded hover:bg-gold-700"
            >
              Submit
            </button>
          </form>
          <button
            onClick={() => setSelectedUser(null)}
            className="mt-4 w-full py-2 bg-gray-600 text-white font-medium rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;