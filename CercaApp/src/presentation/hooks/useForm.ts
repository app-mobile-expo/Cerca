import { useState } from "react";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validateLogin = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim() || !password.trim()) {
      setError("All fields must be filled in.");
      return false;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email.");
      return false;
    }

    setError("");
    return true;
  };

  const handleLogin = () => {
    if (!validateLogin()) return;

    console.log({
      email,
      password,
    });
  };

  return {
    email,
    password,
    setEmail,
    setPassword,
    handleLogin,
    error,
    setError,
  };
}