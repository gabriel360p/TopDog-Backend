
//Configurações do App
import "dotenv/config";
import express from 'express'
const app = express();

import rotas from "./routes.js";
import cors from 'cors'


app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());

//registrando as rotas 
app.use(rotas)





export default app;