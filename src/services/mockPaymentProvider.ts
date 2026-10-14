interface PaymentToProcess {
  id: string;
  amountInCents: number;
}

interface MockProviderResult {
  status: "SUCCEEDED" | "FAILED";
}

export async function processWithMockProvider(
  payment: PaymentToProcess
): Promise<MockProviderResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (payment.amountInCents === 424242) {
    return { status: "FAILED" };
  }

  return { status: "SUCCEEDED" };
}