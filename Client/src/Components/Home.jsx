import { useState } from "react";

import '@fortawesome/fontawesome-free/css/all.min.css';
import Config from "../Config/Config";

let config = new Config();
export default function Home() {
  const [text, setText] = useState("");
  const [corrected, setCorrected] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${config.endpoint}correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      console.log(data);
      setCorrected(data.corrected || "No correction returned.");
    } catch (err) {
      console.error(err);
      setCorrected("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6 font-sans">
      {/* Header */}
      <div className="text-center mb-8">
        <i className="fas fa-robot text-gray-600 text-6xl mb-3"></i>
        <h1 className="text-4xl font-bold mb-1 text-gray-800">AI Grammar Genius</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Improve your writing with a little AI help — quick, simple, and natural.
        </p>
      </div>

      {/* Input & Output */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="bg-white shadow rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
            <i className="fas fa-keyboard"></i> Input Your Text
          </h2>
          <p className="text-gray-500 mb-3">
            Type your text here, and we’ll suggest improvements.
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 h-36 mb-3 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
            >
              {loading ? "Correcting..." : "Enhance with AI"}
            </button>
          </form>
        </div>

        {/* Output Card */}
        <div className="bg-white shadow rounded-lg p-5 relative">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
            <i className="fas fa-check-circle"></i> Corrected Output
          </h2>
          <p className="text-gray-500 mb-3">
            You can edit the text below or copy it.
          </p>

          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 min-h-[160px] bg-gray-50 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800"
            value={corrected}
            onChange={(e) => setCorrected(e.target.value)}
          />

          <button
            onClick={handleCopy}
            className={`absolute top-4 right-4 py-1 px-3 rounded-lg text-sm font-medium 
              ${copied ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-800'} 
              hover:bg-gray-300 transition`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 mt-10 text-center">
        <div className="bg-white shadow rounded-lg p-5">
          <i className="fas fa-bolt text-yellow-500 text-4xl mb-2"></i>
          <h3 className="text-lg font-semibold mb-1 text-gray-800">Fast</h3>
          <p className="text-gray-500 text-sm">
            Get suggestions quickly without distractions.
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <i className="fas fa-brain text-blue-500 text-4xl mb-2"></i>
          <h3 className="text-lg font-semibold mb-1 text-gray-800">Smart</h3>
          <p className="text-gray-500 text-sm">
            Understands context for better corrections.
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <i className="fas fa-sync text-green-500 text-4xl mb-2"></i>
          <h3 className="text-lg font-semibold mb-1 text-gray-800">Improving</h3>
          <p className="text-gray-500 text-sm">
            Continuously learns for more accurate results.
          </p>
        </div>
      </div>
    </div>
  );
}
