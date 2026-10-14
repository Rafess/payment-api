import { prisma } from "../lib/prisma";
import { processWithMockProvider } from "./mockPaymentProvider";

export async function processPaymentById(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    return { kind: "NOT_FOUND" as const };
  }

  if (payment.status !== "PENDING") {
    return {
      kind: "NOT_PENDING" as const,
      payment,
    };
  }

  const claim = await prisma.payment.updateMany({
    where: {
      id,
      status: "PENDING",
    },
    data: {
      status: "PROCESSING",
    },
  });

  if (claim.count === 0) {
    const latestPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!latestPayment) {
      return { kind: "NOT_FOUND" as const };
    }

    return {
      kind: "NOT_PENDING" as const,
      payment: latestPayment,
    };
  }

  const result = await processWithMockProvider(payment);

  await prisma.payment.updateMany({
    where: {
      id,
      status: "PROCESSING",
    },
    data: {
      status: result.status,
    },
  });

  const updatedPayment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!updatedPayment) {
    throw new Error("Payment not found after processing");
  }

  return {
    kind: "PROCESSED" as const,
    payment: updatedPayment,
  };
}