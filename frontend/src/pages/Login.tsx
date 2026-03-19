import { useState } from "react";
import { login } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (err) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-xl w-96 font-sans">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">EDGAR Hub</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 font-semibold text-white py-2 rounded-md hover:bg-blue-700 transition">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
