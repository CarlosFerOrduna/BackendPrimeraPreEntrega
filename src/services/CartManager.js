//@ts-check
import fs from "fs/promises";
import path from "path";
import ProductManager from "./ProductManager.js";

class CartManager {
    constructor() {
        this.id = 0;
        this.path = path.resolve("./src/data/carts.json");
        this.carts = [];
    }

    createCart = async () => {
        await this.#loadCarts();

        this.id =
            this.carts.length > 0 ? Math.max(...this.carts.map((c) => c.id)) + 1 : this.id + 1;

        this.carts = [
            ...this.carts,
            {
                id: this.id,
                products: [],
            },
        ];

        await fs.writeFile(this.path, JSON.stringify(this.carts));

        return this.id;
    };

    updateProductsCart = async (id, productsCart) => {
        await this.#loadCarts();
        const products = await ProductManager.getProducts();

        const existsCart = this.carts.some((c) => c.id === id);
        if (!existsCart) {
            throw new Error(`the cart with id ${id} does not exist`);
        }

        const haveIdProduct = productsCart.every((p) => p?.idProduct || false);
        if (!haveIdProduct) {
            throw new Error(`Product id is ${productsCart.map((p) => p?.idProduct)}`);
        }

        const haveQuantity = productsCart.every((p) => p?.quantity > 0);
        if (!haveQuantity) {
            throw new Error(`Product quantity is ${productsCart.map((p) => p.quantity)}`);
        }

        const productsExists = productsCart.every((pc) => {
            return products.some((p) => p.id === pc.idProduct);
        });
        if (!productsExists) {
            throw new Error(`Product not exists`);
        }

        const isValidQuantity = products.every((p) => {
            return productsCart.map((pc) => pc.quantity <= p.stock);
        });
        if (!isValidQuantity) {
            throw new Error(`The quantity of the product is greater than its stock`);
        }

        // por si llegaran a venir elementos repetidos, primero limpio los repetidos,
        // y despues le sumo el quantity total al product que queda
        let productsWithoutRepeats = productsCart.reduce((acc, e) => {
            if (acc.indexOf(e.idProduct) === -1) {
                acc.push(e);
            }
            return acc;
        }, []);

        productsWithoutRepeats = productsWithoutRepeats.map((p) => {
            let repeated = productsCart.filter((p2) => p.idProduct === p2.idProduct);

            return {
                idProduct: p.idProduct,
                quantity: repeated.reduce((acc, e) => {
                    return acc + e.quantity;
                }, 0),
            };
        });

        this.carts = this.carts.map((c) => {
            return c.id === id
                ? {
                      id: c.id,
                      products: productsWithoutRepeats ?? c.products,
                  }
                : c;
        });

        await fs.writeFile(this.path, JSON.stringify(this.carts));

        return this.getCartById(id);
    };

    updateProductCart = async (idCart, idProduct, quantity) => {
        this.#loadCarts();
        const products = await ProductManager.getProducts();

        const existsProduct = products.some((p) => p.id === idProduct);
        if (!existsProduct) {
            throw new Error(`Product with id ${idProduct} not exists`);
        }

        const existsCart = this.carts.some((c) => c.id === idCart);
        if (!existsCart) {
            throw new Error(`Cart with id ${idCart} not exists`);
        }

        let cart = this.carts.find((c) => c.id === idCart);

        const existsProductInCart = cart.products.some((p) => p.idProduct === idProduct);
        if (existsProductInCart) {
            cart.products = cart.products.map((p) => {
                return p.idProduct === idProduct
                    ? {
                          idProduct: p.idProduct,
                          quantity: p.quantity + quantity,
                      }
                    : p;
            });
        } else {
            cart.products = [...cart.products, { idProduct, quantity }];
        }

        this.carts = this.carts.map((c) => {
            return c.id === idCart ? cart : c;
        });

        await fs.writeFile(this.path, JSON.stringify(this.carts));

        return cart;
    };

    getCarts = async () => {
        await this.#loadCarts();

        return this.carts;
    };

    getCartById = async (id) => {
        await this.#loadCarts();

        const existsCart = this.carts.some((c) => c.id === id);

        if (!existsCart) {
            throw new Error(`Cart with id ${id} not exists`);
        }

        return this.carts.find((c) => c.id === id);
    };

    getProductByCartById = async (idCart, idProduct) => {
        await this.#loadCarts();
        const products = await ProductManager.getProducts();

        const existsCart = this.carts.some((c) => c.id === idCart);

        if (!existsCart) {
            throw new Error(`Cart with id ${idCart} not exists`);
        }

        const cart = this.carts.find((c) => c.id === idCart);

        const existsProduct = products.some((p) => p.id === idProduct);

        if (!existsProduct) {
            throw new Error(`Product with id ${idProduct} not exists`);
        }

        const existsProductInCart = cart.products.some((p) => p.idProduct === idProduct);

        if (!existsProductInCart) {
            throw new Error(`Product with id ${idProduct} not exists in cart with id ${idCart}`);
        }

        const product = cart.products.find((p) => p.idProduct === idProduct);

        return { id: cart.id, products: product };
    };

    deleteCart = async (id) => {
        await this.#loadCarts();

        const existsCart = this.carts.some((c) => c.id === id);

        if (!existsCart) {
            throw new Error(`Cart with id ${id} not exists`);
        }

        this.carts = this.carts.filter((c) => c.id !== id);

        await fs.writeFile(this.path, JSON.stringify(this.carts));
    };

    #loadCarts = async () => {
        try {
            this.carts = JSON.parse(await fs.readFile(this.path, "utf-8"));
        } catch {
            this.carts;
        }
    };
}

export default new CartManager();
