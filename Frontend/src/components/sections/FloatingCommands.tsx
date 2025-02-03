const COMMANDS = [
  {
    text: '"Midas, swap 0.1 ETH to USDC"',
    position: { top: "10%", left: "5%" },
    mobilePosition: { top: "15%", left: "10%" },
    color: "text-yellow-200",
    showOnMobile: true,
  },
  {
    text: '"Midas, provide liquidity for MODE-USDC pool on Kim"',
    position: { top: "12%", right: "0%" },
    mobilePosition: { top: "30%", right: "5%" },
    color: "text-green-300",
    showOnMobile: false,
  },
  {
    text: '"Midas, check my iUSD position health"',
    position: { bottom: "20%", right: "3%" },
    mobilePosition: { bottom: "30%", right: "8%" },
    color: "text-red-200",
    showOnMobile: true,
  },
  {
    text: '"Midas, collect fees from my LP positions"',
    position: { bottom: "1%", right: "25%" },
    mobilePosition: { bottom: "15%", left: "5%" },
    color: "text-emerald-200",
    showOnMobile: true,
  },
  {
    text: '"Midas, vote for Renzo\'s proposal #12"',
    position: { bottom: "10%", left: "8%" },
    mobilePosition: { top: "45%", left: "5%" },
    color: "text-blue-200",
    showOnMobile: true,
  },
  {
    text: '"Midas, what\'s my current voting power?"',
    position: { top: "60%", left: "1%" },
    mobilePosition: { top: "60%", right: "10%" },
    color: "text-purple-400",
    showOnMobile: true,
  },
];

export default function FloatingCommands() {
  return (
    <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
      {COMMANDS.map((command, i) => (
        <div
          key={i}
          className={`absolute text-base lg:text-lg ${command.color}`}
          style={{
            fontFamily: "var(--font-source-serif)",
            fontWeight: 300,
            opacity: 1,
            animation: `sharpPulse ${3 + i * 0.5}s ease-in-out infinite`,
            ...command.position,
          }}
        >
          {command.text}
        </div>
      ))}
    </div>
  );
}
