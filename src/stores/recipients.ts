import { prisma } from "../lib/prisma";
import type { Recipient } from "../types/recipients";

type CreateRecipientInput = Omit<Recipient, "id" | "createdAt" | "updatedAt">;

export async function createRecipient(data: CreateRecipientInput) {
  return prisma.recipient.create({
    data,
  });
}

export async function getRecipientById(id: string) {
  return prisma.recipient.findUnique({
    where: { id },
  });
}

export async function listRecipients() {
  return prisma.recipient.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}