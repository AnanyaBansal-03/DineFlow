import React, { useState } from "react";
import { register } from "../../https";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from "react-icons/fa";

const Register = ({ setIsRegister }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Validate password in real-time
    if (e.target.name === "password") {
      validatePassword(e.target.value);
    }
  };

  const handleRoleSelection = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password validation function
  const validatePassword = (password) => {
    setPasswordErrors({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  // Check if password is valid
  const isPasswordValid = () => {
    return (
      passwordErrors.length &&
      passwordErrors.uppercase &&
      passwordErrors.lowercase &&
      passwordErrors.number &&
      passwordErrors.special
    );
  };

  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message, { variant: "success" });

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
      });

      setPasswordErrors({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });

      setTimeout(() => {
        setIsRegister(false);
      }, 1200);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";

      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate password before submission
    if (!isPasswordValid()) {
      enqueueSnackbar("Please meet all password requirements!", { 
        variant: "warning" 
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  // Validation item component
  const ValidationItem = ({ isValid, text }) => (
    <div className="flex items-center gap-2 text-xs">
      {isValid ? (
        <FaCheckCircle className="text-green-500" size={12} />
      ) : (
        <FaTimesCircle className="text-red-500" size={12} />
      )}
      <span className={isValid ? "text-green-500" : "text-red-500"}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">

        {/* NAME */}
        <div>
          <label className="block text-gray-400 mb-1">
            Employee Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter employee name"
            className="w-full p-2.5 rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-gray-400 mb-1">
            Employee Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter employee email"
            className="w-full p-2.5 rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="block text-gray-400 mb-1">
            Employee Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter employee phone"
            className="w-full p-2.5 rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>

        {/* PASSWORD with validation and toggle */}
        <div>
          <label className="block text-gray-400 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full p-2.5 rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 pr-12 ${
                formData.password && !isPasswordValid()
                  ? "focus:ring-red-500 border border-red-500"
                  : formData.password && isPasswordValid()
                  ? "focus:ring-green-500 border border-green-500"
                  : "focus:ring-yellow-400"
              }`}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          
          {/* Password Requirements - Show only when user starts typing */}
          {formData.password && (
            <div className="mt-3 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700">
              <p className="text-gray-400 text-xs mb-2">Password must contain:</p>
              <div className="grid grid-cols-2 gap-2">
                <ValidationItem 
                  isValid={passwordErrors.length} 
                  text="At least 8 characters" 
                />
                <ValidationItem 
                  isValid={passwordErrors.uppercase} 
                  text="One uppercase letter" 
                />
                <ValidationItem 
                  isValid={passwordErrors.lowercase} 
                  text="One lowercase letter" 
                />
                <ValidationItem 
                  isValid={passwordErrors.number} 
                  text="One number" 
                />
                <ValidationItem 
                  isValid={passwordErrors.special} 
                  text="One special character (!@#$%^&*)" 
                  className="col-span-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* ROLE */}
        <div>
          <label className="block text-gray-400 mb-2">
            Choose your role
          </label>

          <div className="flex gap-2">
            {["Waiter", "Cashier", "Admin"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelection(role)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  formData.role === role
                    ? "bg-yellow-400 text-black"
                    : "bg-[#1f1f1f] text-gray-300 hover:bg-[#2a2a2a]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={registerMutation.isPending || (formData.password && !isPasswordValid())}
          className="w-full py-2.5 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {registerMutation.isPending ? "Creating..." : "Sign Up"}
        </button>

      </form>
    </div>
  );
};

export default Register;