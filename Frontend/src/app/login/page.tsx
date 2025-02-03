"use client";

import { useAuth } from "@crossmint/client-sdk-react-ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Image from "next/image";

export default function LoginPage() {
  const { login, jwt, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (jwt && user) {
      console.log("Crossmint user data:", user);
      router.push("/heymidas");
    }
  }, [jwt, user, router]);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-8 -mt-32">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-yellow-400 bg-clip-text text-transparent">
              Welcome to Midas
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
              Your AI-powered Web3 assistant. Log In to start the conversation.
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={login}
            className="group relative bg-black border border-yellow-400 text-white px-8 py-4 rounded-2xl hover:bg-yellow-400 hover:text-black transition-all duration-200 overflow-hidden"
          >
            <div className="relative z-10 flex items-center gap-3">
              <Image
                src="/midas-logo.png"
                alt="Midas Logo"
                width={24}
                height={24}
                className="group-hover:filter group-hover:brightness-0"
              />
              <span className="font-extralight">Log In</span>
            </div>
            <div className="absolute inset-0 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </button>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                title: "Smart Conversations",
                description: "Chat naturally with an AI that understands Web3",
              },
              {
                title: "Secure Connection",
                description:
                  "Your wallet, your control. Always safe and private",
              },
              {
                title: "24/7 Available",
                description: "Get instant responses whenever you need them",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-800 bg-black/50 backdrop-blur-sm"
              >
                <h3 className="text-white font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
