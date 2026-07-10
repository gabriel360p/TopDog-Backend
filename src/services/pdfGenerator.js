import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

const logoPath = path.resolve(
    "src",
    "assets",
    "top-dog-print.png"
);

let browserInstance = null;

async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        });
    }

    return browserInstance;
}

const pdfOptions = {
    width: "58mm",
    printBackground: true,
    margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0"
    }
};

async function createKitchenPdf(browser, order) {
    const page = await browser.newPage();

    try {
        const itemsHtml = order.cartItems
            .map(item => `
                <div class="item">
                    <strong>${item.quantity}x ${item.title}</strong>
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
                    margin: 0;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    width: 50mm;
                    padding: 2mm;
                    margin: 0 auto;
                    font-family: monospace;
                    font-size: 11px;
                    word-break: break-word;
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

            <strong>Valor Total: R$ ${order.cartItemsValueTotal}</strong>

            <div class="divider"></div>

            ${new Date(order.createdAt).toLocaleString("pt-BR")}

        </body>
        </html>
        `;

        await page.setContent(html);

        return await page.pdf(pdfOptions);
    } finally {
        await page.close();
    }
}

async function createDeliveryPdf(browser, order) {
    const page = await browser.newPage();

    try {
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
                    margin: 0;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    width: 58mm;
                    padding: 2mm;
                    margin: 0 auto;
                    font-family: monospace;
                    font-size: 10px;
                    word-break: break-word;
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

            ${order.formData.change
                ? `
                    <div class="section">
                        Troco para: R$ ${order.formData.change}
                    </div>
                `
                : ""
            }

            <div class="section">
                <strong>Valor Total: R$ ${order.cartItemsValueTotal}</strong>
            </div>

            <div class="divider"></div>

            <div class="center">
                ${new Date(order.createdAt).toLocaleString("pt-BR")}
            </div>

        </body>
        </html>
        `;

        await page.setContent(html);

        return await page.pdf(pdfOptions);
    } finally {
        await page.close();
    }
}

export async function generateOrderPdfs(order) {
    const browser = await getBrowser();

    const [kitchenPdf, deliveryPdf] = await Promise.all([
        createKitchenPdf(browser, order),
        createDeliveryPdf(browser, order)
    ]);

    return {
        kitchenPdf,
        deliveryPdf
    };
}