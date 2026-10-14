import { createHash } from "node:crypto";
import type { Request, Response } from "express";
import { processPaymentById } from "../services/paymentProcessingService";

import type {
  CreatePaymentInput,
  PaymentCurrency,
} from "../types/payment";

import {
  createPayment,
  getPaymentById,
  getPaymentByIdempotencyKey,
  listPayments as listPaymentsStore,
} from "../stores/payments";

import { getRecipientById } from "../stores/recipients";

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isPaymentCurrency(
  value: unknown
): value is PaymentCurrency {
  return value === "BRL" || value === "USD" || value === "EUR";
}

function hasErrorCode(
  error: unknown,
  code: string
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

const paymentController = {
  async post(req: Request, res: Response) {
    const idempotencyKey = req
      .get("Idempotency-Key")
      ?.trim();

    if (!idempotencyKey) {
      return res.status(400).json({
        error: "Idempotency-Key header is required",
      });
    }

    if (idempotencyKey.length > 255) {
      return res.status(400).json({
        error: "Idempotency-Key must not exceed 255 characters",
      });
    }

    const body: unknown = req.body;

    if (!isRecord(body)) {
      return res.status(400).json({
        error: "Request body must be a JSON object",
      });
    }

    const {
      customerId,
      recipientId,
      amountInCents,
      currency,
    } = body;

    if (
      typeof customerId !== "string" ||
      customerId.trim().length === 0
    ) {
      return res.status(400).json({
        error: "customerId is required",
      });
    }

    if (
      typeof recipientId !== "string" ||
      recipientId.trim().length === 0
    ) {
      return res.status(400).json({
        error: "recipientId is required",
      });
    }

    if (
      typeof amountInCents !== "number" ||
      !Number.isSafeInteger(amountInCents) ||
      amountInCents <= 0
    ) {
      return res.status(400).json({
        error: "amountInCents must be a positive integer",
      });
    }

    if (!isPaymentCurrency(currency)) {
      return res.status(400).json({
        error: "currency must be BRL, USD or EUR",
      });
    }

    const input: CreatePaymentInput = {
      customerId: customerId.trim(),
      recipientId: recipientId.trim(),
      amountInCents,
      currency,
    };

    // SHA-256 gera um fingerprint de 64 caracteres hexadecimais.
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex");

    try {
      // 1. Verificar se a operação já foi registrada.
      const existingPayment =
        await getPaymentByIdempotencyKey(idempotencyKey);

      if (existingPayment) {
        if (
          existingPayment.requestFingerprint !== fingerprint
        ) {
          return res.status(409).json({
            error:
              "This Idempotency-Key was already used with different data",
          });
        }

        // Mesma chave e mesmos dados: devolver o registro original.
        return res.status(201).json(existingPayment);
      }

      // 2. Só aceitar destinatários cadastrados.
      const recipient = await getRecipientById(
        input.recipientId
      );

      if (!recipient) {
        return res.status(404).json({
          error: "Recipient not found",
        });
      }

      // 3. Criar e persistir o pagamento.
      try {
        const payment = await createPayment({
          ...input,
          idempotencyKey,
          requestFingerprint: fingerprint,
        });

        return res.status(201).json(payment);
      } catch (error) {
        // Outra requisição pode ter usado a mesma chave
        // simultaneamente. A restrição única do banco decide
        // qual inserção pode ser concluída.
        if (!hasErrorCode(error, "P2002")) {
          throw error;
        }

        const concurrentPayment =
          await getPaymentByIdempotencyKey(idempotencyKey);

        if (!concurrentPayment) {
          throw error;
        }

        if (
          concurrentPayment.requestFingerprint !== fingerprint
        ) {
          return res.status(409).json({
            error:
              "This Idempotency-Key was already used with different data",
          });
        }

        return res.status(201).json(concurrentPayment);
      }
    } catch (error) {
      console.error("Failed to create payment:", error);

      return res.status(500).json({
        error: "Failed to create payment",
      });
    }
  },

  async getPayment(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const payment = await getPaymentById(String(id));

      if (!payment) {
        return res.status(404).json({
          error: "Payment not found",
        });
      }

      return res.status(200).json(payment);
    } catch (error) {
      console.error("Failed to retrieve payment:", error);

      return res.status(500).json({
        error: "Failed to retrieve payment",
      });
    }
  },

  async listPayments(_req: Request, res: Response) {
    try {
      const paymentsArray = await listPaymentsStore();

      return res.status(200).json({
        message:
          paymentsArray.length === 0
            ? "No payments found"
            : "List of all payments",
        data: paymentsArray,
      });
    } catch (error) {
      console.error("Failed to list payments:", error);

      return res.status(500).json({
        error: "Failed to list payments",
      });
    }
  },
  async process(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const result = await processPaymentById(String(id).trim());

    if (result.kind === "NOT_FOUND") {
      return res.status(404).json({
        error: "Payment not found",
      });
    }

    if (result.kind === "NOT_PENDING") {
      return res.status(200).json({
        message: "Payment was not processed again",
        payment: result.payment,
      });
    }

    return res.status(200).json(result.payment);
  } catch (error) {
    console.error("Failed to process payment:", error);

    return res.status(500).json({
      error: "Failed to process payment",
    });
  }
},
};

export default paymentController;