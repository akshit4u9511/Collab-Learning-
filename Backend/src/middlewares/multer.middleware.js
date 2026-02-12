// Backend/src/middlewares/multer.middleware.js

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Multer saves the file temporarily here
        cb(null, "./public/temp"); 
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

export const upload = multer({ storage });