export const approveSignature = async (
  walletLocator: string,
  authorizationId: string,
  signature: string
) => {
  try {
    const response = await fetch("/api/delegate/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletLocator,
        authorizationId,
        signature,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to approve signature");
    }

    return await response.json();
  } catch (error) {
    console.error("Error approving signature:", error);
    throw error;
  }
};
