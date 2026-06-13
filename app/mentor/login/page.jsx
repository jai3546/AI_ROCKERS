"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MentorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Save mentor role to localStorage
    localStorage.setItem("user", JSON.stringify({
      name: "Mentor",
      role: "mentor",
      email: email
    }));
    router.push("/mentor/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Mentor Login 🎓
        </h1>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-3 rounded-lg mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full border p-3 rounded-lg mb-6"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Login as Mentor
        </button>
      </div>
    </div>
  );
}