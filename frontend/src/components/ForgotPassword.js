import React, { useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const sendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith("@gmail.com")) {
      setError("Only Gmail addresses are supported.");
      return;
    }

    try {
      await API.post("/auth/forgot-password/send-otp", { email: normalizedEmail });
      setOtpSent(true);
      setMessage("OTP sent to your Gmail.");
      setError("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP.";
      setError(msg);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter OTP.");
      return;
    }

    try {
      await API.post("/auth/forgot-password/verify-otp", {
        email: email.trim().toLowerCase(),
        otp,
      });
      setOtpVerified(true);
      setMessage("OTP verified. You can now reset your password.");
      setError("");
    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed.";
      setError(msg);
    }
  };

  const resetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!otpVerified || !newPassword) {
      setError("Complete OTP verification and enter new password.");
      return;
    }

    try {
      await API.post("/auth/reset-password", {
        email: normalizedEmail,
        otp,
        newPassword,
      });

      setMessage("Password reset successfully. Redirecting...");
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password.";
      setError(msg);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter Gmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {!otpSent && (
          <button type="button" onClick={sendOtp}>
            Send OTP
          </button>
        )}

        {otpSent && !otpVerified && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="button" onClick={verifyOtp}>
              Verify OTP
            </button>
          </>
        )}

        {otpVerified && (
          <>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <button type="button" onClick={resetPassword}>
              Reset Password
            </button>
          </>
        )}

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <div className="login-link">
          Remembered your password? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
