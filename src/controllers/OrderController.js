class OrderController {
    async store(req, res) {
        // console.log(req.body)
        res.status(201).json({
            message: "Novo pedido salvo com sucesso",
            order: req.body
        })
    }
}

export default new OrderController();