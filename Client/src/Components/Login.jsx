import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Config from "../Config/Config";

const config = new Config();

export default function LoginSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if mode is passed from navigation, default to login
  const [isLogin, setIsLogin] = useState(
    location.state?.mode === "signup" ? false : true
  );
  
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phoneno: "",
    password: "",
    confirmPassword: "",
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const canvasRef = useRef(null);

  // Update isLogin when location state changes
  useEffect(() => {
    if (location.state?.mode) {
      setIsLogin(location.state.mode === "login");
    }
  }, [location.state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 30;
    const colors = [
      "rgba(168, 85, 247, 0.8)",
      "rgba(99, 102, 241, 0.8)",
      "rgba(59, 130, 246, 0.8)",
    ];

    class Particle {
      constructor(x = null, y = null, radius = null) {
        this.x = x !== null ? x : Math.random() * canvas.width;
        this.y = y !== null ? y : Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = radius !== null ? radius : Math.random() * 6 + 4;
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
            const p = new Particle(this.x, this.y, newRadius);
            p.vx = Math.cos(angle) * 2;
            p.vy = Math.sin(angle) * 2;
            newParticles.push(p);
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

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.shouldSplit()) {
          const newParticles = p.split();
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
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      if (!formData.username || !formData.password) {
        showNotification("Username and password are required!", "error");
        return;
      }
      try {
        const response = await fetch(`${config.endpoint}user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("uid", data.uid);
          localStorage.setItem("unqkey", data.unqkey);
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("name", data.user.name);
          localStorage.setItem("email", data.user.email);
          localStorage.setItem("phoneno", data.user.phoneno);
          localStorage.setItem("isLoggedIn", "true");
          showNotification(data.message || "Login successful!", "success");
          setTimeout(() => navigate("/"), 1000);
        } else {
          showNotification(data.message || "Login failed!", "error");
        }
      } catch (err) {
        console.error(err);
        showNotification("An error occurred during login!", "error");
      }
    } else {
      if (
        !formData.username ||
        !formData.name ||
        !formData.email ||
        !formData.phoneno ||
        !formData.password
      ) {
        showNotification("All fields are required!", "error");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showNotification("Passwords do not match!", "error");
        return;
      }
      try {
        const response = await fetch(`${config.endpoint}user/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            name: formData.name,
            email: formData.email,
            phoneno: formData.phoneno,
            password: formData.password,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("uid", data.uid);
          localStorage.setItem("unqkey", data.unqkey);
          showNotification(data.message || "Signup successful!", "success");
          setTimeout(() => navigate("/login", { state: { mode: "login" } }), 1000);
        } else {
          showNotification(data.message || "Signup failed!", "error");
        }
      } catch (err) {
        console.error(err);
        showNotification("An error occurred during signup!", "error");
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {notification.show && (
        <div
          className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl border border-purple-100 transition-all duration-300 hover:shadow-purple-200">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <div className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="tel"
                name="phoneno"
                value={formData.phoneno}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </>
          )}

          {isLogin && (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          )}

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          {isLogin && (
            <div className="flex justify-end mt-2">
              <span
                className="text-sm text-purple-600 cursor-pointer hover:text-purple-700 hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </span>
            </div>
          )}

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </div>

        <p className="text-center mt-6 text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="text-purple-600 cursor-pointer hover:text-purple-700 font-semibold hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}