import express from "express";
import productManager from "../services/ProductManager.js";
import { uploader } from "../utils.js";
export const routerApiProducts = express.Router();

routerApiProducts.use(express.urlencoded({ extended: true }));
routerApiProducts.use(express.json());

routerApiProducts.get("/", async (req, res) => {
    const limit = req?.query?.limit;
    const product = await productManager.getProducts();

    if (!isNaN(limit)) {
        return res.status(200).json({
            status: "success",
            message: `limit = ${limit}`,
            data: product.slice(0, limit),
        });
    }

    return res.status(200).json({
        status: "success",
        message: "All products",
        data: product,
    });
});

routerApiProducts.get("/:pid", async (req, res) => {
    const id = parseInt(req?.params?.pid);
    const product = await productManager.getProductsById(id);

    if (product) {
        return res.status(200).json({
            status: "success",
            message: "Product successfully found",
            data: product,
        });
    }

    throwNotFound(res);
});

routerApiProducts.post("/", uploader.single("thumbnail"), async (req, res) => {
    const product = {
        ...req?.body,
        thumbnail: `$http://localhost:8080/${req?.file?.filename}` ?? null,
    };

    if (product) {
        const newProduct = await productManager.addProduct(product);

        if (typeof newProduct == "object") {
            return res.status(201).json({
                status: "success",
                msg: `Successfully created product`,
                data: newProduct,
            });
        }
    }

    throwNotFound(res);
});

routerApiProducts.put("/:pid", uploader.single("file"), async (req, res) => {
    const id = parseInt(req?.params?.pid);
    let product = await productManager.getProductsById(id);

    if (req?.body && product) {
        const productUpdate = {
            id,
            ...req.body,
            thumbnail: `$http://localhost:8080/${req?.file?.filename}` ?? null,
        };

        await productManager.updateProduct(productUpdate);

        return res.status(201).json({
            status: "success",
            msg: `Product successfully updated`,
            data: productUpdate,
        });
    }

    throwNotFound(res);
});

routerApiProducts.delete("/:pid", async (req, res) => {
    const id = parseInt(req.params.pid);
    let product = await productManager.getProductsById(id);

    if (product) {
        await productManager.deleteProduct(id);

        return res.status(201).json({
            status: "success",
            msg: `Product id ${id} successfully removed`,
            data: product,
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
