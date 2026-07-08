import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendOrderEmail(
    order,
    kitchenPdf,
    deliveryPdf
) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.STORE_EMAIL,

        subject: `🌭 Novo Pedido - ${order.orderId}`,

        html: `
            <h2>Novo Pedido Recebido</h2>

            <p>
                <strong>Pedido:</strong>
                ${order.orderId}
            </p>

            <p>
                <strong>Telefone:</strong>
                ${order.formData.phone}
            </p>

            <h3>Itens</h3>

            <ul>
                ${order.cartItems
                .map(
                    item =>
                        `<li>${item.quantity}x ${item.title}</li>`
                )
                .join("")}
            </ul>
        `,

        attachments: [
            {
                filename: `${order.orderId}-cozinha.pdf`,
                content: kitchenPdf,
                contentType: "application/pdf"
            },
            {
                filename: `${order.orderId}-entrega.pdf`,
                content: deliveryPdf,
                contentType: "application/pdf"
            }
        ]
    });
}