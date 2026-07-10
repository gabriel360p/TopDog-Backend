import { Router } from "express";
import OrderController from "./controllers/OrderController.js";

const rotas = new Router();

rotas.post('/pedido', OrderController.store);
app.get("/teste-api-topdog", (req, res) => {
    return res.json({
        status: "API ONLINE"
    });
});

export default rotas;