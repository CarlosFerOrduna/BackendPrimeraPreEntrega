//@ts-check
import express from "express";
import handlebars from "express-handlebars";
import path from "path";
import { routerApiCarts } from "./routes/carts.api.routes.js";
import { routerApiProducts } from "./routes/products.api.routes.js";
import { routerViewsProducts } from "./routes/products.views.routes.js";
const app = express();
const port = 8080;

app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", handlebars.engine());
app.set("views", path.resolve("./src/views"));
app.set("view engine", "handlebars");

app.use(express.static(path.resolve("./src/public")));

app.use("/api/products", routerApiProducts);
app.use("/api/carts", routerApiCarts);

app.use("/views/products", routerViewsProducts);

app.get("*", (req, res) => {
    return res.status(404).json({
        status: "error",
        message: "Not found",
        data: [],
    });
});

app.listen(port, async () => {
    console.log(`App listening on port ${port} http://localhost:8080/`);
});
