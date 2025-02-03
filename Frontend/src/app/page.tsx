"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Modal from "@/components/ui/Modal";
import WaitlistForm from "@/components/sections/WaitlistForm";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";

// Create a client component that uses useSearchParams
function HomeContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [referralId, setReferralId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref_id");
    if (ref) {
      setReferralId(ref);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen starry-sky">
      <Navbar openModal={() => setIsModalOpen(true)} />
      <Hero openModal={() => setIsModalOpen(true)} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <WaitlistForm referralId={referralId} />
      </Modal>
    </div>
  );
}

// Main page component with Suspense
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
