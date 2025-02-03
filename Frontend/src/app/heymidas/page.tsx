"use client";

import { useAuth } from "@crossmint/client-sdk-react-ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import ChatInterface from "@/components/chat/ChatInterface";
import ConfigInterface from "@/components/config/ConfigInterface";

export default function HeyMidasPage() {
  const { jwt } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chat" | "config">("chat");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!jwt) {
        router.replace("/login");
      } else {
        setIsLoading(false);
      }
    }
  }, [jwt, router]);

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // Only render the page content if we have a JWT
  if (!jwt) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-800 mb-4">
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-2 px-4 font-extralight transition-colors ${
              activeTab === "chat"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`py-2 px-4 font-extralight transition-colors ${
              activeTab === "config"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Config
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-140px)]">
          {activeTab === "chat" ? <ChatInterface /> : <ConfigInterface />}
        </div>
      </div>
    </>
  );
}
