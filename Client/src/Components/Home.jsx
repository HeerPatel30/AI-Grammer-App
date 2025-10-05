import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaKeyboard, FaCheckCircle, FaBolt, FaBrain, FaSync } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import Config from "../Config/Config.jsx";
import HistoryView from "./HistoryView";
import ResponsiveHistory from "./ResponsiveHistory";

let config = new Config();

console.log("API Endpoint:", config.endpoint);

export default function Home() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [corrected, setCorrected] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    if (uid) setIsLoggedIn(true);
  }, []);

  const handleLogout = async () => {
    const uid = localStorage.getItem("uid");
    if (!uid) return;

    try {
      const res = await fetch(`${config.endpoint}user/logout`, {
        method: "POST",
        headers: { uid },
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.clear(); // Clear all localStorage items
        setIsLoggedIn(false);
        toast.success(data.message || "Logout successful!");
        navigate("/login");
      } else {
        toast.error(data.message || "Logout failed!");
      }
    } catch (err) {
      toast.error("Something went wrong!");
    }
  };

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = [];
    const nodeCount = 50;
    const colors = [
      "rgba(139, 92, 246, 0.6)",
      "rgba(59, 130, 246, 0.6)",
      "rgba(16, 185, 129, 0.6)"
    ];

    class Node {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 3 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.pulsePhase = Math.random() * Math.PI * 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulsePhase += 0.02;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        const pulse = Math.sin(this.pulsePhase) * 0.5 + 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < nodeCount; i++) nodes.push(new Node());

    function connectNodes() {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - distance / 200) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function drawDataFlow() {
      const time = Date.now() * 0.001;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200 && Math.random() > 0.98) {
            const progress = (Math.sin(time + i + j) + 1) / 2;
            const x = nodes[i].x + (nodes[j].x - nodes[i].x) * progress;
            const y = nodes[i].y + (nodes[j].y - nodes[i].y) * progress;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(139, 92, 246, 0.8)";
            ctx.fill();
          }
        }
      }
    }

    function animate() {
      ctx.fillStyle = "rgba(249, 250, 251, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((node) => {
        node.update();
        node.draw();
      });
      connectNodes();
      drawDataFlow();
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

  // Get or create device ID for anonymous users
  const getOrCreateDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      // Generate unique device ID: dev_timestamp_randomstring
      deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return toast.error("Please enter text!");
    setLoading(true);
    const toastId = toast.loading("Processing...");

    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      const unqkey = localStorage.getItem("unqkey");
      const deviceId = getOrCreateDeviceId(); // Get or create device ID

      const res = await fetch(`${config.endpoint}ai/correct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
          uid: uid || "",
          unqkey: unqkey || "",
          "x-device-id": deviceId // Add device ID for rate limiting
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (data.message && data.message.startsWith("Daily limit reached")) {
        toast.error(data.message, { id: toastId });
        setCorrected("");
      } else {
        setCorrected(data.corrected || "No correction returned.");
        toast.success("Text corrected!", { id: toastId });
        setRefreshHistory((prev) => !prev);
      }
    } catch (err) {
      setCorrected("");
      toast.error("An error occurred. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Text copied!");
  };

  const handleHistorySelect = (chat) => {
    setText(chat.originalText);
    setCorrected(chat.correctedText);
  };

  return (
    <div className="flex min-h-screen relative bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Responsive Sidebar - Pass HistoryView as a component */}
      <ResponsiveHistory 
        onSelect={handleHistorySelect} 
        refreshTrigger={refreshHistory}
        HistoryComponent={HistoryView}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 md:left-64 right-0 bg-white shadow-md z-40 backdrop-blur-md bg-opacity-95">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaRobot className="text-gray-700 text-xl md:text-2xl" />
              <h1 className="text-lg md:text-2xl font-bold text-gray-800">AI Grammar Genius</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="px-3 md:px-4 py-1 text-sm md:text-base rounded-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium transition"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login", { state: { mode: "login" } })}
                    className="px-3 md:px-4 py-1 text-sm md:text-base rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/login", { state: { mode: "signup" } })}
                    className="px-3 md:px-4 py-1 text-sm md:text-base rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium transition"
                  >
                    Signup
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="pt-20 md:pt-24 p-4 md:p-8 w-full flex-1 overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <FaRobot className="text-gray-600 text-4xl md:text-6xl mb-3 mx-auto" />
            <h2 className="text-2xl md:text-4xl font-bold mb-1 text-gray-800">AI Grammar Genius</h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Improve your writing with a little AI help — quick, simple, and natural.
            </p>
          </div>

          {/* Input/Output Section */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Input */}
            <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 h-full">
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <FaKeyboard /> Input Your Text
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-3">
                Type your text here, and we'll suggest improvements.
              </p>
              <form onSubmit={handleSubmit} className="w-full">
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 h-36 mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  placeholder="Type or paste your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Correcting..." : "Enhance with AI"}
                </button>
              </form>
            </div>

            {/* Output */}
            <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 h-full relative">
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <FaCheckCircle /> Corrected Output
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-3">
                Your corrected text appears here — ready to copy.
              </p>
              <textarea
                readOnly
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[160px] bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 cursor-default text-sm md:text-base"
                value={corrected}
              />
              {corrected && (
                <button
                  onClick={handleCopy}
                  className={`absolute top-4 right-4 py-1 px-3 rounded-lg text-xs md:text-sm font-medium cursor-pointer
                    ${copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"} 
                    hover:bg-gray-300 transition`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-10">
            <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 flex flex-col items-center">
              <FaBolt className="text-yellow-500 text-3xl md:text-4xl mb-3" />
              <h4 className="text-base md:text-lg font-semibold mb-2 text-gray-800">Fast</h4>
              <p className="text-gray-500 text-xs md:text-sm text-center">
                Get suggestions quickly without distractions.
              </p>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 flex flex-col items-center">
              <FaBrain className="text-purple-500 text-3xl md:text-4xl mb-3" />
              <h4 className="text-base md:text-lg font-semibold mb-2 text-gray-800">Smart</h4>
              <p className="text-gray-500 text-xs md:text-sm text-center">
                Understands context for better corrections.
              </p>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 flex flex-col items-center">
              <FaSync className="text-green-500 text-3xl md:text-4xl mb-3" />
              <h4 className="text-base md:text-lg font-semibold mb-2 text-gray-800">Improving</h4>
              <p className="text-gray-500 text-xs md:text-sm text-center">
                Continuously learns for more accurate results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}