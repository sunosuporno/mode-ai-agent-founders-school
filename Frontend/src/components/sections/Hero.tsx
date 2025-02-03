import Button from "@/components/ui/Button";
import FloatingCommands from "./FloatingCommands";

interface HeroProps {
  openModal: () => void;
}

export default function Hero({ openModal }: HeroProps) {
  return (
    <main className="relative max-w-7xl mx-auto px-6 py-32 md:py-40 text-center">
      <FloatingCommands />
      <h1 className="font-[family-name:var(--font-source-serif)] text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight font-light">
        Your AI companion for DeFi
      </h1>
      <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light">
        Simply tell Midas what you want to do - swap tokens, provide liquidity,
        or vote on governance - and watch as it executes complex DeFi operations
        with a single message.
      </p>
      <Button onClick={openModal} className="px-8 py-4 text-lg">
        Get Early Access
      </Button>
    </main>
  );
}
