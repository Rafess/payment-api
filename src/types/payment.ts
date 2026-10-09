export type PaymentCurrency = "BRL" | "USD" | "EUR";

export interface Payment {
  id: string;
  customerId: string;
  recipientId: string;
  amountInCents: number;
  currency: PaymentCurrency;
  status: "PENDING";
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePaymentInput {
  customerId: string;
  recipientId: string;
  amountInCents: number;
  currency: PaymentCurrency;
}

export interface IdempotencyRecord {
  fingerprint: string;
  payment: Payment;
}
