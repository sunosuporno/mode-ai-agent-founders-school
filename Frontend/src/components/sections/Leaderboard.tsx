import React, { useState, useEffect } from "react";

interface LeaderboardEntry {
  amount_referred: number;
  first_name: string;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(
          "https://api.getwaitlist.com/api/v1/waitlist/23640/leaderboard?total_signups=10"
        );
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg md:text-xl mb-4 md:mb-6 font-[family-name:var(--font-source-serif)] font-light">
        Waitlist Leaderboard
      </h3>
      <div className="space-y-3 md:space-y-4">
        {leaderboard.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2.5 md:p-3 bg-gray-900 rounded-lg text-sm md:text-base font-[family-name:var(--font-source-serif)] font-extralight"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-yellow-400">#{index + 1}</span>
              <span className="text-white">{entry.first_name}</span>
            </div>
            <span className="text-white">
              {entry.amount_referred} referral
              {entry.amount_referred !== 1 ? "s" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
