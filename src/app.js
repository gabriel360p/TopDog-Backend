
//Configurações do App
import express from 'express'
const app = express();

import rotas from "./routes.js";
import cors from 'cors'


app.use(cors())
app.use(express.json());

//registrando as rotas 
app.use(rotas)





export default app;