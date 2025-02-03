export const createSignature = async (
  walletLocator: string,
  message: string,
  apiUrl: string,
  params: {
    chain: string;
    expiresAt: string;
  }
) => {
  try {
    const response = await fetch("/api/delegate/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `${apiUrl}${walletLocator}/signatures`,
        walletLocator,
        params,
        type: "evm-message",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create signature");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating signature:", error);
    throw error;
  }
};
