import type { Request, Response } from "express";

import {
  createRecipient,
  getRecipientById,
  listRecipients as listRecipientsStore,
} from "../stores/recipients";

const recipientController = {
  async post(req: Request, res: Response) {
    const body: unknown = req.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        error: "Request body must be a JSON object",
      });
    }

    const {
      name,
      destinationCountry,
      destinationReference,
    } = body as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        error: "name is required",
      });
    }

    if (
      typeof destinationCountry !== "string" ||
      !["BR", "US", "EU"].includes(
        destinationCountry.trim().toUpperCase()
      )
    ) {
      return res.status(400).json({
        error:
          "destinationCountry must be one of the following: BR, US, EU",
      });
    }

    if (
      typeof destinationReference !== "string" ||
      destinationReference.trim().length === 0
    ) {
      return res.status(400).json({
        error: "destinationReference is required",
      });
    }

    try {
      const recipient = await createRecipient({
        name: name.trim(),
        destinationCountry:
          destinationCountry.trim().toUpperCase(),
        destinationReference: destinationReference.trim(),
      });

      return res.status(201).json(recipient);
    } catch (error) {
      console.error("Failed to create recipient:", error);

      return res.status(500).json({
        error: "Failed to create recipient",
      });
    }
  },

  async getRecipient(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const recipient = await getRecipientById(String(id).trim());

      if (!recipient) {
        return res.status(404).json({
          error: "Recipient not found",
        });
      }

      return res.status(200).json(recipient);
    } catch (error) {
      console.error("Failed to retrieve recipient:", error);

      return res.status(500).json({
        error: "Failed to retrieve recipient",
      });
    }
  },

  async listRecipients(_req: Request, res: Response) {
    try {
      const recipientsArray = await listRecipientsStore();

      return res.status(200).json({
        data: recipientsArray,
      });
    } catch (error) {
      console.error("Failed to list recipients:", error);

      return res.status(500).json({
        error: "Failed to list recipients",
      });
    }
  },
};

export default recipientController;