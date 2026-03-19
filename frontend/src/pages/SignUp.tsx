import { useState } from "react";
import { register } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const SignUp = () => {
  const [username, setUsername] = useState("newuser");
  const [password, setPassword] = useState("password123");
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, password);
      toast.success("Account created successfully");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-xl w-96 font-sans">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Pick a username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 font-semibold text-white py-2 rounded-md hover:bg-blue-700 transition">
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
