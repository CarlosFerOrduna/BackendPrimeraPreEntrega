//@ts-check
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, path.resolve("./src/public/uploads"));
    },
    filename: (req, file, cd) => {
        cd(null, file.originalname);
    },
});

export const uploader = multer({ storage });
