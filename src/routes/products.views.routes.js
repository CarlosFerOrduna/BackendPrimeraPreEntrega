import express from "express";
import productManager from "../services/ProductManager.js";
export const routerViewsProducts = express.Router();

routerViewsProducts.use(express.urlencoded({ extended: true }));
routerViewsProducts.use(express.json());

routerViewsProducts.get("/", async (req, res) => {
    const limit = req?.query?.limit;
    const products = await productManager.getProducts();

    if (!isNaN(limit)) {
        return res.render("products", {
            title: "Limited products",
            products,
        });
    }

    return res.render("products", {
        title: "All productos",
        products,
    });
});
