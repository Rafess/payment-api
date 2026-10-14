import { prisma } from "../lib/prisma";
import type { CreatePaymentRecordInput } from "../types/payment";

export async function createPayment(
  data: CreatePaymentRecordInput
) {
  return prisma.payment.create({
    data,
  });
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
  });
}

export async function getPaymentByIdempotencyKey(
  idempotencyKey: string
) {
  return prisma.payment.findUnique({
    where: { idempotencyKey },
  });
}

export async function listPayments() {
  return prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}