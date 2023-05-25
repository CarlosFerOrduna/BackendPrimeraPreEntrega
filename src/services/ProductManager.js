//@ts-check
import fs from "fs/promises";
import path from "path";
class ProductManager {
    constructor() {
        this.id = 0;
        this.path = path.resolve("./src/data/products.json");
        this.products = [];
    }

    addProduct = async (product) => {
        await this.#setProducts();
        const existsCode = this.products.some((p) => p.code === product.code);
        this.id =
            this.products.length > 0
                ? Math.max(...this.products.map((p) => p.id)) + 1
                : this.id + 1;

        if (
            !existsCode &&
            product?.title &&
            product?.description &&
            product?.code &&
            product?.price &&
            product?.status &&
            product?.stock &&
            product?.category
        ) {
            const newProduct = {
                id: this.id,
                title: product?.title,
                description: product?.description,
                code: product?.code,
                price: product?.price,
                status: product?.status ?? true,
                stock: product?.stock,
                category: product?.category,
                thumbnails: [product?.thumbnail] || [],
            };
            this.products = [...this.products, newProduct];

            await fs.writeFile(this.path, JSON.stringify(this.products));

            return { id: this.id, ...product };
        } else {
            let error;

            existsCode && (error = "The code already exists");
            product?.title ?? (error = `title is ${product.title}`);
            product?.description ?? (error = `description is ${product.description}`);
            product?.code ?? (error = `code is ${product.code}`);
            product?.price ?? (error = `price is ${product.price}`);
            product?.status ?? (error = `status is ${product.status}`);
            product?.stock ?? (error = `stock is ${product.stock}`);
            product?.category ?? (error = `category is ${product.category}`);

            return error;
        }
    };

    getProducts = async () => {
        try {
            await this.#setProducts();
        } catch {
            throw new Error("Something went wrong");
        } finally {
            return this.products;
        }
    };

    getProductsById = async (id) => {
        try {
            await this.#setProducts();
        } catch {
            throw new Error("Something went wrong");
        } finally {
            return this.products.find((p) => p.id === id) || "Not found";
        }
    };

    updateProduct = async (product) => {
        try {
            await this.#setProducts();
            if (this.products.some((p) => p.id === product.id)) {
                this.products = this.products.map((p) => {
                    return p.id === product.id
                        ? {
                              id: p.id,
                              title: product?.title ?? p.title,
                              description: product?.description ?? p.description,
                              code: product?.code ?? p.code,
                              price: product?.price ?? p.price,
                              status: product?.status ?? p.status,
                              stock: product?.stock ?? p.stock,
                              category: product?.category ?? p.category,
                              thumbnails: [...p.thumbnails, product?.thumbnail] ?? p.thumbnails,
                          }
                        : p;
                });
                await fs.writeFile(this.path, JSON.stringify(this.products));
            } else {
                console.error("Not found");
            }
        } catch {
            throw new Error("Something went wrong");
        }
    };

    deleteProduct = async (id) => {
        try {
            await this.#setProducts();
            if (this.products.some((p) => p.id === id)) {
                this.products = this.products.filter((p) => p.id !== id);
                await fs.writeFile(this.path, JSON.stringify(this.products));
            } else {
                console.error("Not found");
            }
        } catch {
            throw new Error("Something went wrong");
        }
    };

    #setProducts = async () => {
        try {
            this.products = JSON.parse(await fs.readFile(this.path, "utf-8"));
        } catch {
            this.products;
        }
    };
}

export default new ProductManager();
