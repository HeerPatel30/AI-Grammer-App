import { useState, useEffect } from "react";
import Config from "../Config/Config";

let config = new Config();

export default function HistoryView({ onSelect, refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      const unqkey = localStorage.getItem("unqkey");

      const res = await fetch(`${config.endpoint}ai/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
          uid: uid || "",
          unqkey: unqkey || "",
        },
      });
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch history initially and whenever refreshTrigger changes
  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  // Elegant neutral button colors
  const buttonColors = [
    "bg-slate-50 text-slate-900 hover:bg-slate-100",
    "bg-slate-100 text-slate-900 hover:bg-slate-200",
    "bg-slate-200 text-slate-900 hover:bg-slate-300",
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto shadow-xl flex flex-col z-20">
      {/* Sidebar Title */}
      <div className="sticky top-0 bg-white z-20 px-4 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 text-center">History</h2>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-4 text-gray-500 text-center">Loading history...</div>
      )}

      {/* No history */}
      {!loading && history.length === 0 && (
        <div className="p-4 text-gray-500 text-center">No history found.</div>
      )}

      {/* History List */}
      {!loading &&
        history.map((day) => (
          <div key={day._id} className="mb-6">
            {/* Day Header */}
            <div className="text-center text-gray-700 text-xs font-medium mb-3 bg-gray-50 px-2 py-1 rounded-full shadow-sm">
              {day._id}
            </div>

            {/* Chat items */}
            <div className="flex flex-col gap-2 px-3">
              {day.chats
                .slice()
                .reverse()
                .map((chat, index) => (
                  <button
                    key={chat._id}
                    onClick={() => onSelect(chat)}
                    className={`px-4 py-2 rounded-full text-sm shadow-sm truncate text-left transition ${buttonColors[index % buttonColors.length]}`}
                  >
                    {chat.originalText}
                  </button>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}
