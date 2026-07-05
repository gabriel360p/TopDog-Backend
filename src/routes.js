import { Router } from "express";
import OrderController from "./controllers/OrderController.js";

const rotas = new Router();

rotas.post('/pedido', OrderController.store);


export default rotas;