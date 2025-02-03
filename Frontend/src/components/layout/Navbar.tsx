"use client";

import Image from "next/image";
import Link from "next/link";
import { useWallet, useAuth } from "@crossmint/client-sdk-react-ui";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

interface NavbarProps {
  openModal?: () => void; // Made optional with ? since it might not be needed in all cases
}

export default function Navbar({ openModal }: NavbarProps) {
  const { wallet } = useWallet();
  const { logout, jwt } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to truncate wallet address
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
    setIsDropdownOpen(false);
  };

  const copyToClipboard = async () => {
    if (wallet?.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/midas-logo.png"
              alt="Midas Logo"
              width={32}
              height={32}
            />
            <span className="text-white font-semibold text-xl">Midas</span>
          </Link>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-6">
            <a
              href="https://discord.gg/GHgwpDACGf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Discord
            </a>
            <a
              href="https://x.com/bettercallmidas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              X
            </a>

            {/* Wallet Section with Dropdown */}
            {jwt ? (
              wallet?.address ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <span className="text-gray-400 font-light">
                      {truncateAddress(wallet.address)}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-900 border border-gray-800 shadow-lg">
                      <div className="p-2">
                        <button
                          onClick={copyToClipboard}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          {copied ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <ClipboardIcon className="w-4 h-4" />
                          )}
                          {copied ? "Copied!" : "Copy Address"}
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              )
            ) : (
              <button
                onClick={openModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
