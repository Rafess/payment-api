import { Request, Response } from "express";
import { PaymentCurrency } from "../types/payment";
import { CreatePaymentInput, Payment, IdempotencyRecord } from "../types/payment";
import { randomUUID } from "crypto";


const payments = new Map<string, Payment>();

const idempotencyRecords = new Map<string, IdempotencyRecord>();

function isPaymentCurrency(
  value: unknown
): value is PaymentCurrency {
  return value === "BRL" || value === "USD" || value === "EUR";
}

const paymentController = {
  async post(req: Request, res: Response) {
    const idempotencyKey = req.headers["idempotency-key"] || req.headers["Idempotency-Key"] || req.headers["Idempotency-key"];
    console.log("Idempotency-Key:", idempotencyKey);
    const {customerId, amountInCents, currency} = req.body as Record<string, unknown>;

    if (!idempotencyKey) {
      res.status(400).json({
        error: "Idempotency-Key header is required",
      });
      return;
    }

    if (idempotencyKey.length > 255) {
      res.status(400).json({
        error: "Idempotency-Key must not exceed 255 characters",
      });
      return;
    }

    const body: unknown = req.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      res.status(400).json({
        error: "Request body must be a JSON object",
      });
      return;
    }


    if (
      typeof customerId !== "string" ||
      customerId.trim().length === 0
    ) {
      res.status(400).json({
        error: "customerId is required",
      });
      return;
    }

    if (
      typeof amountInCents !== "number" ||
      !Number.isSafeInteger(amountInCents) ||
      amountInCents <= 0
    ) {
      res.status(400).json({
        error: "amountInCents must be a positive integer",
      });
      return;
    }

    if (!isPaymentCurrency(currency)) {
      res.status(400).json({
        error: "currency must be BRL, USD or EUR",
      });
      return;
    }

    // Normalizar os dados antes de comparar as requisições.
    const input: CreatePaymentInput = {
      customerId: customerId.trim(),
      amountInCents,
      currency,
    };

    const fingerprint = JSON.stringify(input);

    // 3. Verificar se essa chave já foi utilizada.
    const existingRecord = idempotencyRecords.get(idempotencyKey);

    if (existingRecord) {
      if (existingRecord.fingerprint !== fingerprint) {
        res.status(409).json({
          error:
            "This Idempotency-Key was already used with different data",
        });
        return;
      }

      // Mesma chave e mesmos dados: devolver o pagamento original.
      res.status(201).json(existingRecord.payment);
      return;
    }

    // 4. Criar o pagamento somente se a chave for nova.
    const payment: Payment = {
      id: randomUUID(),
      customerId: input.customerId,
      amountInCents: input.amountInCents,
      currency: input.currency,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    // 5. Registrar o pagamento e a chave.
    payments.set(payment.id, payment);

    idempotencyRecords.set(idempotencyKey, {
      fingerprint,
      payment,
    });

    res.status(201).json(payment);
  },

  async getPayment(req: Request, res: Response) {
    const { id } = req.params;

    return res.status(200).json({
      message: `Payment details for ID: ${id}`,
    });
  },

  async listPayments(req: Request, res: Response) {
    return res.status(200).json({
      message: "List of all payments",
    });
  },
};

export default paymentController;