import { Router } from "express";
import paymentController from "../controllers/paymentController";
import recipientController from "../controllers/recipientsController";

const router = Router();
// ---- PAYMENTS  ----
// Criar um pagamento
router.post("/payments", paymentController.post);

// Buscar um pagamento por ID
router.get("/payments/:id", paymentController.getPayment);

// Listar pagamentos
router.get("/payments", paymentController.listPayments);

// Processar um pagamento por ID
router.post("/payments/:id/process", paymentController.process);

// --- RECIPIENTS ----
router.get("/recipients/:id", recipientController.getRecipient);
router.get("/recipients", recipientController.listRecipients);
router.post("/recipients", recipientController.post);
export default router;