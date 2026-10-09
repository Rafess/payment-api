import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { Recipient } from "../types/recipients";
import {recipients} from "../stores/recipients";

const recipientController = {
  async post(req: Request, res: Response) {
    const { name, destinationCountry, destinationReference } = req.body as Record<string, unknown>;

    if (
      typeof name !== "string" ||
      name.trim().length === 0
    ) {
      res.status(400).json({
        error: "name is required",
      });
      return;
    }
    if(destinationCountry !== "BR" && destinationCountry !== "US" && destinationCountry !== "EU") {
      res.status(400).json({
        error: "destinationCountry must be one of the following: BR, US, EU",
        });
        return;
    }
    if(!destinationReference || typeof destinationReference !== "string" || destinationReference.trim().length === 0) {
      res.status(400).json({
        error: "destinationReference is required",
      });
      return;
    }
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const recipient: Recipient = {
      id,
      name,
      destinationCountry,
      destinationReference,
      createdAt,
    };
    recipients.set(id, recipient);
    return res.status(201).json(recipient);
  },

  async getRecipient(req: Request, res: Response) {
    const { id } = req.params;
    const recipient = recipients.get(id.toString());

    if (!recipient) {
      return res.status(404).json({
        error: "Recipient not found",
      });
    }
    return res.status(200).json(recipient);
   
  },

  async listRecipients(req: Request, res: Response) {
    const recipientsArray = Array.from(recipients.values());
    if (recipientsArray.length === 0) {
      return res.status(200).json({
        message: "No recipients found",
        data: [],
      });
    }
    return res.status(200).json({
      message: "List of all recipients",
      data: recipientsArray,
    });

  },
};

export default recipientController;