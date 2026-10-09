import { Router } from "express";
import paymentController from "../controllers/paymentController";

const router = Router();

// Criar um pagamento
router.post("/payments", paymentController.post);

// Buscar um pagamento por ID
router.get("/payments/:id", paymentController.getPayment);

// Listar pagamentos
router.get("/payments", paymentController.listPayments);

export default router;