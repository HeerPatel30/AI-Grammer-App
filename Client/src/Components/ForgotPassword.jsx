import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Config from "../Config/Config";

const config = new Config();

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 30;
    const colors = ["rgba(168, 85, 247, 0.8)", "rgba(99, 102, 241, 0.8)", "rgba(59, 130, 246, 0.8)"];

    class Particle {
      constructor(x, y, radius) {
        this.x = x ?? Math.random() * canvas.width;
        this.y = y ?? Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = radius ?? Math.random() * 6 + 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = 0;
        this.maxLife = Math.random() * 200 + 100;
        this.canSplit = this.radius > 3;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      split() {
        const newParticles = [];
        const numSplits = Math.floor(Math.random() * 2) + 2;
        const newRadius = this.radius / 2;
        if (newRadius > 1.5) {
          for (let i = 0; i < numSplits; i++) {
            const angle = (Math.PI * 2 * i) / numSplits;
            const particle = new Particle(this.x, this.y, newRadius);
            particle.vx = Math.cos(angle) * 2;
            particle.vy = Math.sin(angle) * 2;
            newParticles.push(particle);
          }
        }
        return newParticles;
      }
      shouldSplit() {
        return this.canSplit && this.life >= this.maxLife;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (particle.shouldSplit()) {
          const newParticles = particle.split();
          particles.splice(i, 1);
          particles.push(...newParticles);
        }
      }
      if (particles.length > 150) particles.splice(0, particles.length - 150);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connectParticles();
      requestAnimationFrame(animate);
    }

    animate();
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Start 5-min timer
  const startTimer = () => {
    setTimer(300);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!email) return showNotification("Please enter your email!", "error");
    try {
      const response = await fetch(`${config.endpoint}user/sendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(data.message || "OTP sent successfully!", "success");
        startTimer();
        setStep(2);
      } else showNotification(data.message || "Failed to send OTP!", "error");
    } catch {
      showNotification("Something went wrong!", "error");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return showNotification("Please enter OTP!", "error");
    try {
      const response = await fetch(`${config.endpoint}user/verifyotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(data.message || "OTP verified successfully!", "success");
        setStep(3);
      } else showNotification(data.message || "Invalid OTP!", "error");
    } catch {
      showNotification("Something went wrong!", "error");
    }
  };

  // Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword)
      return showNotification("Please fill all fields!", "error");
    if (newPassword !== confirmPassword)
      return showNotification("Passwords do not match!", "error");

    try {
      const response = await fetch(`${config.endpoint}user/forgotpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newpassword: newPassword,
          confirmnewpassword: confirmPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(data.message || "Password reset successful!", "success");
        setTimeout(() => navigate("/login"), 1500);
      } else showNotification(data.message || "Failed to reset password!", "error");
    } catch {
      showNotification("Something went wrong!", "error");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }} />

      {notification.show && (
        <div
          className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white font-semibold`}
        >
          {notification.message}
        </div>
      )}

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl border border-purple-100">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center mb-6">
          Forgot Password
        </h2>

        {step === 1 && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <button
              onClick={handleSendOtp}
              disabled={timer > 0}
              className={`w-full mt-4 py-3 text-white font-bold rounded-xl transition-all ${
                timer > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105"
              }`}
            >
              {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-gray-600 text-center mb-4">
              OTP sent to <span className="font-semibold">{email}</span>
            </p>
            <p className="text-xs text-gray-500 text-center mb-3">
              OTP is valid for <span className="font-semibold text-purple-600">5 minutes</span>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl hover:scale-105 transition-all"
            >
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-3 mb-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full p-3 mb-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <button
              onClick={handleResetPassword}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl hover:scale-105 transition-all"
            >
              Submit
            </button>
          </>
        )}

        <p
          className="text-center mt-6 text-purple-600 cursor-pointer hover:underline font-semibold"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
}
