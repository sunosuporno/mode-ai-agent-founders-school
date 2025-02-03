import { useWallet } from "@crossmint/client-sdk-react-ui";
import { WebAuthnP256 } from "ox";

interface AllowanceResponse {
  messageToSign: string;
  authorizationId: string;
  signature?: string;
  signer?: string;
  status?: string;
}

type Wallet = ReturnType<typeof useWallet>["wallet"];

export const requestTokenAllowance = async (
  walletLocator: string,
  chain: string,
  wallet: Wallet,
  expiresAt?: string
): Promise<AllowanceResponse> => {
  try {
    console.log("Requesting token allowance for wallet:", walletLocator);
    console.log("Chain:", chain);
    console.log("Wallet:", wallet);

    const body: { chain: string; expiresAt?: string } = { chain };
    if (expiresAt) {
      body.expiresAt = expiresAt;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/wallets/${walletLocator}/delegated-key`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    console.log("Received response status:", response.status);

    if (!response.ok) {
      console.error("Failed to request allowance, status:", response.status);
      throw new Error("Failed to request allowance");
    }

    const data = await response.json();
    console.log("Server response for allowance:", data);

    // Extract the required fields from the response
    const allowanceResponse: AllowanceResponse = {
      messageToSign: data.messageToSign,
      authorizationId: data.authorizationId,
      signer: data.signer,
    };

    console.log("credentialId: ", data.signer.split("evm-passkey:")[1]);
    if (wallet?.client?.wallet) {
      const signingResult: WebAuthnP256.sign.ReturnType =
        await WebAuthnP256.sign({
          credentialId: data.signer.split("evm-passkey:")[1],
          challenge: data.messageToSign,
        });

      console.log("Extracted allowance data:", allowanceResponse);

      // Sign the message using the wallet

      // Convert signingResult to be JSON-serializable
      const jsonSigningResult = {
        ...signingResult,
        signature: {
          r: signingResult.signature.r.toString(),
          s: signingResult.signature.s.toString(),
          yParity: signingResult.signature.yParity,
        },
      };

      // Use jsonSigningResult in the fetch call
      const approveResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/approve-delegate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletLocator,
            signatureId: allowanceResponse.authorizationId,
            signer: allowanceResponse.signer,
            signingResult: jsonSigningResult,
          }),
        }
      );

      console.log(
        "Received approve-delegate response status:",
        approveResponse.status
      );

      if (!approveResponse.ok) {
        console.error(
          "Failed to approve delegate, status:",
          approveResponse.status
        );
        throw new Error("Failed to approve delegate");
      }

      const approveData = await approveResponse.json();
      console.log("Approve delegate response:", approveData);
      allowanceResponse.status = approveData.status;
    } else {
      console.warn("Wallet client or wallet is not available for signing");
    }

    return allowanceResponse;
  } catch (error) {
    console.error("Error requesting allowance:", error);
    throw error;
  }
};
