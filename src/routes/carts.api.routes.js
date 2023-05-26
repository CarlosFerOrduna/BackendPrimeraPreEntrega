//@ts-check
import express from "express";
import cartManager from "../services/CartManager.js";
export const routerApiCarts = express.Router();

routerApiCarts.use(express.urlencoded({ extended: true }));
routerApiCarts.use(express.json());

routerApiCarts.get("/", async (req, res) => {
    const carts = await cartManager.getCarts();

    return res.status(200).json({
        status: "success",
        message: "Cart successfully found",
        data: carts,
    });
});

routerApiCarts.get("/:cid", async (req, res) => {
    const id = parseInt(req?.params?.cid);
    const cart = await cartManager.getCartById(id);

    if (cart) {
        return res.status(200).json({
            status: "success",
            message: "Cart successfully found",
            data: cart,
        });
    }

    throwNotFound(res);
});

routerApiCarts.get("/:cid/:pid", async (req, res) => {
    const idCart = parseInt(req?.params?.cid);
    const idProduct = parseInt(req?.params?.pid);

    if (idCart && idProduct) {
        const result = await cartManager.getProductByCartById(idCart, idProduct);

        return res.status(200).json({
            status: "success",
            message: "Cart and product successfully found",
            data: result,
        });
    }

    throwNotFound(res);
});

routerApiCarts.post("/", async (req, res) => {
    const idCart = await cartManager.createCart();
    let products = req?.body?.products;
    let cart = { id: idCart, products: [{}] };

    if (products.length > 0) {
        products = products.map((p) => {
            return {
                idProduct: p.idProduct || p.id,
                quantity: p.quantity,
            };
        });

        cart = await cartManager.updateProductsCart(idCart, products);
    }

    return res.status(201).json({
        status: "success",
        msg: `Successfully created cart`,
        data: cart,
    });
});

routerApiCarts.post("/:cid/products/:pid", async (req, res) => {
    const idCart = parseInt(req?.params?.cid);
    const idProduct = parseInt(req?.params?.pid);
    const quantity = parseInt(req?.body?.quantity);

    if (idCart && idProduct && quantity) {
        const result = await cartManager.updateProductCart(idCart, idProduct, quantity);

        return res.status(201).json({
            status: "success",
            msg: `Cart successfully updated`,
            data: result,
        });
    }

    throwNotFound(res);
});

routerApiCarts.put("/:cid", async (req, res) => {
    const id = parseInt(req?.params?.cid);
    const products = req?.body;

    if (id && products) {
        const result = await cartManager.updateProductsCart(id, products);

        return res.status(201).json({
            status: "success",
            msg: `Cart successfully updated`,
            data: result,
        });
    }

    throwNotFound(res);
});

routerApiCarts.delete("/:cid", async (req, res) => {
    const id = parseInt(req.params.cid);
    let cart = await cartManager.getCartById(id);

    if (cart) {
        await cartManager.deleteCart(id);

        return res.status(201).json({
            status: "success",
            msg: `Cart id ${id} successfully removed`,
            data: cart,
        });
    }

    throwNotFound(res);
});

const throwNotFound = (res) => {
    return res.status(404).json({
        status: "error",
        msg: "Not found",
        data: [],
    });
};
