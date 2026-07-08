import { generateOrderPdfs } from "../services/pdfGenerator.js";
import { sendOrderEmail } from "../services/emailService.js";

class OrderController {
    async store(req, res) {
        try {
            const order = req.body;

            const {
                kitchenPdf,
                deliveryPdf
            } = await generateOrderPdfs(order);

            await sendOrderEmail(
                order,
                kitchenPdf,
                deliveryPdf
            );

            return res.status(201).json({
                success: true,
                message: "Pedido enviado com sucesso"
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Erro ao processar pedido"
            });
        }
    }
}

export default new OrderController();