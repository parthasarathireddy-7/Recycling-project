import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { authApi } from "../services/api";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("admin@recycling.org");
  const [password, setPassword] = useState("admin123");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Administrator");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await authApi.register({
          email,
          full_name: fullName,
          password,
          role,
        });
        // Auto login after registration
        await authApi.login(email, password);
      } else {
        await authApi.login(email, password);
      }
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleType: "admin" | "manager" | "collector") => {
    if (roleType === "admin") {
      setEmail("admin@recycling.org");
      setPassword("admin123");
    } else if (roleType === "manager") {
      setEmail("manager@recycling.org");
      setPassword("manager123");
    } else {
      setEmail("collector@recycling.org");
      setPassword("collector123");
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF2F2] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-red-100 max-w-md w-full p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-red-500/25">
            <Recycle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">EcoRoute Optimizer</h2>
          <p className="text-xs text-gray-500">Recycling Logistics & Fleet Route Minimization Platform</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Turner"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Work Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@recycling.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-semibold"
              >
                <option value="Administrator">Administrator</option>
                <option value="Manager">Manager</option>
                <option value="Collection Staff">Collection Staff</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In to Platform"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Credentials Helper */}
        <div className="pt-2 border-t border-gray-100 space-y-2 text-xs text-gray-500">
          <div className="font-bold text-gray-700 text-center text-[11px] uppercase tracking-wider">
            Quick Demo Fill
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              className="py-1.5 px-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold text-[10px] cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("manager")}
              className="py-1.5 px-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold text-[10px] cursor-pointer"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("collector")}
              className="py-1.5 px-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold text-[10px] cursor-pointer"
            >
              Driver
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
          >
            {isRegister ? "Already registered? Sign In" : "Need an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};

