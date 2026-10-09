export type PaymentCurrency = "BRL" | "USD" | "EUR";

export interface Payment {
  id: string;
  customerId: string;
  amountInCents: number;
  currency: PaymentCurrency;
  status: "PENDING";
  createdAt: string;
}

export interface CreatePaymentInput {
  customerId: string;
  amountInCents: number;
  currency: PaymentCurrency;
}

export interface IdempotencyRecord {
  fingerprint: string;
  payment: Payment;
}
