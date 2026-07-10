//Configurações do servidor
import app from "./app.js";
// const PORT = 3000;
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log("Servidor Subiu")
})

