"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Note: In a full implementation, we'd trigger the migration of local storage here
      }
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err: unknown) {
      setError("Gagal masuk dengan Google.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-brand-500 mb-1 tracking-tight">SIVA</h1>
          <p className="text-brand-700 font-semibold text-sm mb-4">Siklus Interaktif Vitalitas wanitA</p>
          <h2 className="text-xl font-bold text-brand-900 mb-2">{isLogin ? "Selamat Datang Kembali" : "Buat Akun Baru"}</h2>
          <p className="text-brand-600 text-sm">Simpan data siklus Anda dengan aman</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-brand-900 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-900 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Memproses..." : (isLogin ? "Masuk" : "Daftar")}
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-gray-200 w-full absolute"></div>
          <span className="bg-white px-4 text-xs text-gray-400 relative z-10">ATAU</span>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center shadow-sm disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Masuk dengan Google
        </button>

        <p className="text-center mt-8 text-sm text-gray-600">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-600 font-semibold hover:underline"
          >
            {isLogin ? "Daftar sekarang" : "Masuk di sini"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
