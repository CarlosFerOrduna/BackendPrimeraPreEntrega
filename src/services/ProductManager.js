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
        await this.#loadProducts();
        this.id =
            this.products.length > 0
                ? Math.max(...this.products.map((p) => p.id)) + 1
                : this.id + 1;

        const existsCode = this.products.some((p) => p.code === product.code);
        if (existsCode) {
            throw new Error("The code already exists");
        }

        if (!product.title || !isNaN(product.title)) {
            throw new Error(`title is ${product.title}`);
        }

        if (!product.description || !isNaN(product.description)) {
            throw new Error(`description is ${product.description}`);
        }

        if (!product.code || !isNaN(product.code)) {
            throw new Error(`code is ${product.code}`);
        }

        if (!product.price || isNaN(product.price)) {
            throw new Error(`price is ${product.price}`);
        }

        if (!product.stock || isNaN(product.stock)) {
            throw new Error(`stock is ${product.stock}`);
        }

        if (!product.category || !isNaN(product.category)) {
            throw new Error(`category is ${product.category}`);
        }

        const newProduct = {
            id: this.id,
            title: product?.title,
            description: product?.description,
            code: product?.code,
            price: parseFloat(product?.price),
            status: product?.status ?? true,
            stock: parseInt(product?.stock),
            category: product?.category,
            thumbnails: [product?.thumbnail] || [],
        };

        this.products = [...this.products, newProduct];

        await fs.writeFile(this.path, JSON.stringify(this.products));

        return newProduct;
    };

    getProducts = async () => {
        await this.#loadProducts();

        return this.products;
    };

    getProductsById = async (id) => {
        await this.#loadProducts();

        const existsProduct = this.products.some((p) => p.id === id);

        if (!existsProduct) {
            throw new Error("The product does not exist");
        }

        return this.products.find((p) => p.id === id) || "Not found";
    };

    updateProduct = async (product) => {
        await this.#loadProducts();

        const existsProduct = this.products.some((p) => p.id === product.id);

        if (!existsProduct) {
            throw new Error("The product does not exist");
        }

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

        return this.products.find((p) => p.id === product.id);
    };

    deleteProduct = async (id) => {
        await this.#loadProducts();

        const existsProduct = this.products.some((p) => p.id === id);

        if (!existsProduct) {
            throw new Error("The product does not exist");
        }

        this.products = this.products.filter((p) => p.id !== id);

        await fs.writeFile(this.path, JSON.stringify(this.products));
    };

    #loadProducts = async () => {
        try {
            this.products = JSON.parse(await fs.readFile(this.path, "utf-8"));
        } catch {
            this.products;
        }
    };
}

export default new ProductManager();
