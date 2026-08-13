import { useState } from "react";

import { useAuth } from "@/presentation/context/AuthContext";

export function useRegister() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);

  const validateRegister = () => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !displayName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("All fields must be filled in.");
      return false;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email.");
      return false;
    }

    if (password.length < 8) {
      setError(
        "Password must have at least 8 characters.",
      );
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    setError("");
    return true;
  };

  const handleRegister = async (): Promise<boolean> => {
    if (!validateRegister()) {
      return false;
    }

    try {
      setIsLoading(true);
      setError("");

      return register({
        displayName: displayName.trim(),
        email: email.trim().toLowerCase(),
        password,
        capacities: ["customer"],
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error,
      );

      setError(
        "Could not create the account. Please try again.",
      );

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    displayName,
    email,
    password,
    confirmPassword,

    setDisplayName,
    setEmail,
    setPassword,
    setConfirmPassword,

    handleRegister,

    error,
    setError,
    isLoading,
  };
}
