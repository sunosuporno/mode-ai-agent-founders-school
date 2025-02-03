"use client";

import {
  CrossmintProvider,
  CrossmintAuthProvider,
} from "@crossmint/client-sdk-react-ui";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_API_KEY ?? ""}>
      <CrossmintAuthProvider
        embeddedWallets={{
          type: "evm-smart-wallet",
          defaultChain: "base",
          createOnLogin: "all-users",
        }}
        loginMethods={["email", "google", "farcaster", "twitter"]}
      >
        {children as JSX.Element}
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
