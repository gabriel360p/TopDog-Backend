import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

const logoPath = path.resolve(
    "src",
    "assets",
    "top-dog-print.png"
);

async function createKitchenPdf(browser, order) {
    const page = await browser.newPage();

    const itemsHtml = order.cartItems
        .map(item => `
            <div class="item">
                <strong>${item.quantity}x ${item.title}</strong>
            </div>
        `)
        .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @page {
                size: 58mm auto;
                margin: 2mm;
            }

            body {
                width: 54mm;
                font-family: monospace;
                font-size: 11px;
            }

            .center {
                text-align: center;
            }

            .divider {
                border-top: 1px dashed #000;
                margin: 5px 0;
            }

            .item {
                margin-bottom: 5px;
            }
        </style>
    </head>

    <body>

        <div class="center">
            <h3>TOP DOG</h3>
            <strong>COZINHA</strong>
        </div>

        <div class="divider"></div>

        <strong>Pedido:</strong><br>
        ${order.orderId}

        <div class="divider"></div>

        ${itemsHtml}

        <div class="divider"></div>

        <strong>Observação:</strong><br>
        ${order.formData.observation || "Nenhuma"}

        <div class="divider"></div>
        
        <div class="section">
            <strong>Valor Total: ${order.cartItemsValueTotal}</strong>
        </div>
        ${new Date(order.createdAt).toLocaleString("pt-BR")}

    </body>
    </html>
    `;

    await page.setContent(html);

    const pdf = await page.pdf({
        width: "58mm",
        printBackground: true
    });

    await page.close();

    return pdf;
}

async function createDeliveryPdf(browser, order) {
    const page = await browser.newPage();

    const logoBuffer = await fs.readFile(logoPath);
    const logoBase64 = logoBuffer.toString("base64");

    const itemsHtml = order.cartItems
        .map(item => `
            <div style="margin-bottom:4px;">
                ${item.quantity}x ${item.title}
            </div>
        `)
        .join("");

    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">

        <style>
            @page {
                size: 58mm auto;
                margin: 4mm;
            }

            body {
                width: 54mm;
                font-family: monospace;
                font-size: 10px;
                margin: 0;
                padding: 0;
            }

            .logo {
                display: block;
                width: 18mm;
                margin: 0 auto 4mm auto;
            }

            .center {
                text-align: center;
            }

            .divider {
                border-top: 1px dashed #000;
                margin: 4px 0;
            }

            .section {
                margin-bottom: 4px;
            }
        </style>
    </head>

    <body>

        <img
            class="logo"
            src="data:image/png;base64,${logoBase64}"
        />

        <div class="center">
            <strong>ENTREGA</strong>
        </div>

        <div class="divider"></div>

        <div class="section">
            <strong>Pedido:</strong><br>
            ${order.orderId}
        </div>

        <div class="divider"></div>

        <div class="section">
            <strong>Telefone:</strong><br>
            ${order.formData.phone || "-"}
        </div>

        <div class="section">
            <strong>Endereço:</strong><br>
            ${order.formData.street || ""}, ${order.formData.number || ""}
            <br>
            ${order.formData.neighborhood || ""}
            <br>
            ${order.formData.address2 || ""}
        </div>

        <div class="divider"></div>

        <div class="section">
            <strong>Pagamento:</strong><br>
            ${(order.formData.payment_method || "").toUpperCase()}
        </div>

        <div class="divider"></div>

        <div class="section">
            <strong>Itens:</strong><br>
            ${itemsHtml}
        </div>

        <div class="divider"></div>

        <div class="section">
            <strong>Observação:</strong><br>
            ${order.formData.observation || "Nenhuma"}
        </div>

        <div class="divider"></div>

        <div class="section">
            <strong>Valor Total: ${order.cartItemsValueTotal}</strong>
        </div>

        <div class="center">
            ${new Date(order.createdAt).toLocaleString("pt-BR")}
        </div>

    </body>
    </html>
    `;

    await page.setContent(html, {
        waitUntil: "networkidle0"
    });

    const pdf = await page.pdf({
        width: "58mm",
        printBackground: true
    });

    await page.close();

    return pdf;
}

export async function generateOrderPdfs(order) {
    const browser = await puppeteer.launch({
        headless: true
    });

    try {
        const [kitchenPdf, deliveryPdf] = await Promise.all([
            createKitchenPdf(browser, order),
            createDeliveryPdf(browser, order)
        ]);

        return {
            kitchenPdf,
            deliveryPdf
        };
    } finally {
        await browser.close();
    }
}