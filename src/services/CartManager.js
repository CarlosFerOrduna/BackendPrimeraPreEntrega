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
        await this.#setCarts();
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
        await this.#setCarts();
        const products = await ProductManager.getProducts();

        const cartExists = this.carts.some((c) => c.id === id);
        const haveIdProduct = productsCart.every((p) => p?.idProduct);
        const haveQuantity = productsCart.every((p) => p?.quantity > 0);
        const isValidQuantity = products.every((p) => {
            return productsCart.map((pc) => pc.quantity <= p.stock);
        });
        const productsExists = productsCart.every((pc) => {
            return products.some((p) => p.id === pc.idProduct);
        });

        if (cartExists && productsExists && haveIdProduct && haveQuantity && isValidQuantity) {
            // por si llegaran a venir elementos repetidos, los limpio, pero acumulando el quantity de cada uno de los repetidos
            let productsWithoutRepeats = productsCart.reduce((acc, e) => {
                if (acc.indexOf(e.idProduct) === -1) {
                    acc.push(e.idProduct);
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
            // por si llegaran a venir elementos repetidos, los limpio, pero acumulando el quantity de cada uno de los repetidos

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
        }

        let error;

        !haveIdProduct && (error = `Product id is ${productsCart.map((p) => p?.idProduct)}`);
        !productsExists && (error = `Product not exists`);
        !haveQuantity && (error = `Product quantity is ${productsCart.map((p) => p.quantity)}`);
        !isValidQuantity && (error = `The quantity of the product is greater than its stock`);
        !cartExists && (error = `the cart with id ${id} does not exist`);

        return error;
    };

    updateProductCart = async (idCart, idProduct, quantity) => {
        let cart = await this.getCartById(idCart);
        let product = await ProductManager.getProductsById(idProduct);

        if (typeof cart === "object" && typeof product === "object") {
            if (cart.products.some((p) => p.idProduct === idProduct)) {
                console.log(idProduct);
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
        }

        return "Not found";
    };

    getCarts = async () => {
        try {
            await this.#setCarts();
        } catch {
            throw new Error("Something went wrong");
        } finally {
            return this.carts;
        }
    };

    getCartById = async (id) => {
        try {
            await this.#setCarts();
        } catch {
            throw new Error("Something went wrong");
        } finally {
            return this.carts.find((c) => c.id === id) || "Not found";
        }
    };

    getProductByCartById = async (idCart, idProduct) => {
        try {
            await this.#setCarts();
        } catch {
            throw new Error("Something went wrong");
        } finally {
            const cart = this.carts.find((c) => c.id === idCart);
            const product = cart.products.find((p) => p.idProduct === idProduct);

            return { id: cart.id, products: product } || "Not found";
        }
    };

    deleteCart = async (id) => {
        try {
            await this.#setCarts();
            if (this.carts.some((c) => c.id === id)) {
                this.carts = this.carts.filter((c) => c.id !== id);

                await fs.writeFile(this.path, JSON.stringify(this.carts));
            } else {
                console.error("Not found");
            }
        } catch {
            throw new Error("Something went wrong");
        }
    };

    #setCarts = async () => {
        try {
            this.carts = JSON.parse(await fs.readFile(this.path, "utf-8"));
        } catch {
            this.carts;
        }
    };
}

export default new CartManager();
