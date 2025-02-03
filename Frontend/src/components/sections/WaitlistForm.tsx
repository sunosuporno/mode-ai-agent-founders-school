"use client";

import { useState } from "react";

interface SignupResponse {
  priority: number;
  referral_link: string;
  amount_referred: number;
  signup_token: string;
}

interface WaitlistFormProps {
  referralId?: string | null;
}

export default function WaitlistForm({ referralId }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [checkEmail, setCheckEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [signupData, setSignupData] = useState<SignupResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      email,
      waitlist_id: 23640,
      first_name: discordUsername,
      last_name: "",
      referral_link: referralId
        ? `http://midas.yieldhive.xyz?ref_id=${referralId}`
        : undefined,
    };

    try {
      const response = await fetch(
        "https://api.getwaitlist.com/api/v1/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSignupData(data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://api.getwaitlist.com/api/v1/signup?waitlist_id=23640&email=${encodeURIComponent(
          checkEmail
        )}&priority=true`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("Check response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSignupData(data);
      setSuccess(true);
    } catch (err) {
      console.error("Check error:", err);
      setError(
        err instanceof Error ? err.message : "Email not found in waitlist"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(signupData?.referral_link || "");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div className="text-center font-[family-name:var(--font-source-serif)] font-light">
      <h2 className="text-2xl mb-4">Join the Waitlist</h2>
      {success && signupData ? (
        <div className="space-y-3 md:space-y-4">
          {checkEmail ? (
            <div className="p-3 md:p-4 bg-[#151B2B] rounded-xl border border-gray-800/50 text-left space-y-4">
              <p className="text-white text-sm md:text-base">
                Below is your referral link:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={signupData.referral_link}
                  readOnly
                  className="w-full p-2 bg-[#0A0F1C] rounded border border-gray-800/50 text-xs md:text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 bg-[#0A0F1C] rounded border border-gray-800/50 hover:border-yellow-400/50 transition-colors text-sm md:text-base whitespace-nowrap"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-green-400">
                Thanks for joining! We&apos;ll be in touch soon.
              </p>
              <div className="p-3 md:p-4 bg-[#151B2B] rounded-xl border border-gray-800/50 text-left space-y-4">
                <div className="text-gray-400">
                  Your position:{" "}
                  <span className="text-yellow-400">
                    #{signupData.priority}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm md:text-base">
                    Share your referral link to move up the waitlist:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={signupData.referral_link}
                      readOnly
                      className="w-full p-2 bg-[#0A0F1C] rounded border border-gray-800/50 text-xs md:text-sm"
                    />
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-[#0A0F1C] rounded border border-gray-800/50 hover:border-yellow-400/50 transition-colors text-sm md:text-base whitespace-nowrap"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              placeholder="Your discord username"
              required
              className="w-full p-4 rounded-xl bg-[#151B2B] border border-gray-800/50 focus:border-yellow-400/50 outline-none font-[family-name:var(--font-source-serif)] font-light text-lg transition-colors placeholder:text-gray-500"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-800 focus:border-yellow-400 outline-none font-[family-name:var(--font-source-serif)] font-light text-lg"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-4 px-6 rounded-xl font-light text-lg transition-all hover:bg-yellow-300 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Waitlist"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-800/50">
            <button
              onClick={() => setShowCheck(!showCheck)}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Already signed up?
            </button>

            {showCheck && (
              <form onSubmit={handleCheck} className="mt-4 space-y-4">
                <input
                  type="email"
                  value={checkEmail}
                  onChange={(e) => setCheckEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full p-4 rounded-xl bg-[#151B2B] border border-gray-800/50 focus:border-yellow-400/50 outline-none font-[family-name:var(--font-source-serif)] font-light text-lg transition-colors placeholder:text-gray-500"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#151B2B] text-white py-4 px-6 rounded-xl font-light text-lg border border-gray-800/50 hover:border-yellow-400/50 transition-colors"
                >
                  {loading ? "Checking..." : "Get your referral code"}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
