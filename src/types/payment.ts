export type PaymentCurrency = "BRL" | "USD" | "EUR";

export interface CreatePaymentInput {
  customerId: string;
  recipientId: string;
  amountInCents: number;
  currency: PaymentCurrency;
}

export interface CreatePaymentRecordInput
  extends CreatePaymentInput {
  idempotencyKey: string;
  requestFingerprint: string;
}