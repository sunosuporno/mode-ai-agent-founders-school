"use client";

import Leaderboard from "@/components/sections/Leaderboard";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0 backdrop-blur-md">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-5xl">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-yellow-400/20 rounded-[24px] blur-xl opacity-50" />

        {/* Main modal content */}
        <div className="relative bg-[#0A0F1C]/80 backdrop-blur-xl border border-gray-100/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>{children}</div>
            <div className="md:hidden mt-8 pt-8 border-t border-gray-100/10">
              <Leaderboard />
            </div>
            <div className="hidden md:block border-l border-gray-100/10 pl-8">
              <Leaderboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
