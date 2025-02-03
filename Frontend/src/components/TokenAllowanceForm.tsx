"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { requestTokenAllowance } from "@/api";

// Helper function to generate expiry timestamp 25 years from now
const generateExpiryTimestamp = (): string => {
  const TWENTY_FIVE_YEARS_MS = 25 * 365 * 24 * 60 * 60 * 1000;
  return (Date.now() + TWENTY_FIVE_YEARS_MS).toString();
};

export default function TokenAllowanceForm() {
  const { wallet } = useWallet();
  const [tokenName, setTokenName] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("base");
  const [loading, setLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string>("");

  // Format number with commas
  const formatNumber = (value: string) => {
    // Remove any existing commas first
    const number = value.replace(/,/g, "");
    // Only proceed if it's a valid number
    if (!isNaN(Number(number))) {
      return Number(number).toLocaleString();
    }
    return value;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove commas for processing
    const rawValue = e.target.value.replace(/,/g, "");
    // Only update if it's a valid number or empty
    if (rawValue === "" || !isNaN(Number(rawValue))) {
      setAmount(rawValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.address || !amount) return;

    setLoading(true);
    setApprovalStatus(null);
    setApprovalMessage("");

    try {
      // First check if allowance already exists
      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/check-delegated/${wallet.address}`
      );

      if (!checkResponse.ok) {
        throw new Error("Failed to check existing allowances");
      }

      const delegatedData = await checkResponse.json();
      console.log("Existing delegated permissions:", delegatedData);
      let response;

      // Check if the selected chain already has active status
      if (
        delegatedData.chains &&
        Object.keys(delegatedData.chains).length > 0 &&
        delegatedData.chains[network]?.status === "active"
      ) {
        console.log(`Allowance already active for ${network}`);
        setApprovalStatus("success");
        setApprovalMessage("Allowance already approved!");
        setLoading(false);
        return;
      } else if (
        delegatedData.chains &&
        Object.keys(delegatedData.chains).length > 0 &&
        Object.keys(delegatedData.chains).some(
          (chain) =>
            chain !== network && delegatedData.chains[chain].status === "active"
        )
      ) {
        // Different chain exists with active status, don't send expiryAt
        console.log(
          "Different chain has active status, proceeding without expiry"
        );
        response = await requestTokenAllowance(wallet.address, network, wallet);
      } else {
        // No active chains, proceed with expiry
        console.log(
          `No active allowance found for ${network}, proceeding with request`
        );
        response = await requestTokenAllowance(
          wallet.address,
          network,
          wallet,
          generateExpiryTimestamp()
        );
      }

      if (response.status === "success") {
        setApprovalStatus("success");
        setApprovalMessage("Allowance approved successfully!");
      } else {
        setApprovalStatus("failed");
        setApprovalMessage("Failed to approve allowance");
      }
    } catch (error) {
      console.error("Failed to request/approve allowance:", error);
      setApprovalStatus("failed");
      setApprovalMessage("Failed to approve allowance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-extralight text-gray-400 mb-1">
          Network
        </label>
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-yellow-400 font-extralight"
        >
          <option value="base" className="font-extralight">
            Base
          </option>
          <option value="mode" className="font-extralight">
            Mode
          </option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-extralight text-gray-400 mb-1">
          Token
        </label>
        <select
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-yellow-400 font-extralight"
        >
          <option value="USDC" className="font-extralight">
            USDC
          </option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-extralight text-gray-400 mb-1">
          Maximum Amount
        </label>
        <input
          type="text" // Changed from "number" to "text" to allow commas
          value={formatNumber(amount)}
          onChange={handleAmountChange}
          placeholder="Enter amount"
          className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-yellow-400 font-extralight"
        />
      </div>

      {approvalStatus && (
        <div
          className={`p-4 rounded-lg ${
            approvalStatus === "success"
              ? "bg-green-900/50 text-green-400"
              : "bg-red-900/50 text-red-400"
          }`}
        >
          {approvalMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !amount}
        className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 font-extralight"
      >
        {loading ? "Requesting..." : "Request Allowance"}
      </button>
    </form>
  );
}
