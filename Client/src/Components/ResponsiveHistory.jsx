import { useState } from "react";

export default function ResponsiveHistory({ refreshTrigger, onSelect, HistoryComponent }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile button to open history */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-20 left-4 z-50 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg hover:shadow-xl transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar for desktop */}
      <div className="hidden md:block relative z-20 w-64">
        <HistoryComponent onSelect={onSelect} refreshTrigger={refreshTrigger} />
      </div>

      {/* Overlay when drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Slide-in drawer for mobile */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden overflow-hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-teal-500">
          <h3 className="text-white font-semibold text-lg">History</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 transition"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bg-white h-full overflow-y-auto">
          <HistoryComponent 
            onSelect={(chat) => { 
              onSelect(chat); 
              setIsOpen(false); 
            }} 
            refreshTrigger={refreshTrigger} 
          />
        </div>
      </div>
    </>
  );
}