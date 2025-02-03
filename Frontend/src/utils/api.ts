export interface TokenAllowanceRequest {
  type: "erc20-token-transfer";
  data: {
    tokenName: string;
    allowance: string;
  };
}

export const requestTokenAllowance = async (
  walletLocator: string,
  tokenName: string,
  allowance: string
) => {
  try {
    const response = await fetch("/api/delegate/allowance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletLocator,
        request: {
          type: "erc20-token-transfer",
          data: {
            tokenName,
            allowance,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to request allowance");
    }

    return await response.json();
  } catch (error) {
    console.error("Error requesting allowance:", error);
    throw error;
  }
};
