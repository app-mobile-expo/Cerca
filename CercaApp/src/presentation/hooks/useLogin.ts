import { useState } from "react";

import { useAuth } from "@/presentation/context/AuthContext";

export function useLogin() {
const {login,} = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const validateLogin = () => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !email.trim() ||
      !password.trim()
    ) {
      setError(
        "All fields must be filled in.",
      );

      return false;
    }

    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid email.",
      );

      return false;
    }

    setError("");

    return true;
  };

  const handleLogin =
    async (): Promise<void> => {
      if (!validateLogin()) {
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const success = await login({
          email:
            email.trim().toLowerCase(),
          password,
        });

        if (!success) {
          setError(
            "Could not sign in. Please check your credentials.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

  return {
    email,
    password,

    setEmail,
    setPassword,

    handleLogin,

    error,
    setError,

    isLoading,
  };
}