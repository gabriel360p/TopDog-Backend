import rateLimit from "express-rate-limit";
import { convertMS } from "../utils/convertMs.js";

const message = "Muitas requisições feitas a partir deste IP. Tente novamente mais tarde."

export const limiter = rateLimit({
    windowMs: convertMS(15),
    max: 15,
    message: message,
    standardHeaders: true, // Retorna os cabeçalhos 'RateLimit-*'
    legacyHeaders: false, // Desativa os cabeçalhos antigos 'X-RateLimit-*'
})