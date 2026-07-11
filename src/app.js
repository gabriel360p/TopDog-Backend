
//Configurações do App
import "dotenv/config";
import express from 'express'
const app = express();

import rotas from "./routes.js";
import cors from 'cors'
import { limiter } from "./configs/rateLimit.js";

//rate limi
app.use(limiter)

app.use(cors({
    origin: process.env.FRONT_END,
}));

app.use(express.json());

//registrando as rotas 
app.use(rotas)





export default app;