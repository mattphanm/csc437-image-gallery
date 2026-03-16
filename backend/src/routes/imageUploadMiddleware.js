import path from "node:path";
import multer from "multer";
import { getEnvVar } from "../getEnvVar.js";

class ImageFormatError extends Error {}

function getUploadDirectory() {
    const uploadDirFromEnv = getEnvVar("IMAGE_UPLOAD_DIR", false) || "uploads";
    return path.resolve(uploadDirFromEnv);
}

function getFileExtensionFromMimeType(mimeType) {
    if (mimeType === "image/png") {
        return "png";
    }
    if (mimeType === "image/jpg" || mimeType === "image/jpeg") {
        return "jpg";
    }
    throw new ImageFormatError("Unsupported image type");
}

const storageEngine = multer.diskStorage({
    destination: function destination(_req, _file, cb) {
        cb(null, getUploadDirectory());
    },
    filename: function filename(_req, file, cb) {
        try {
            const extension = getFileExtensionFromMimeType(file.mimetype);
            const generatedName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
            cb(null, generatedName);
        } catch (error) {
            cb(error, "");
        }
    },
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024,
    },
});

export function handleImageFileErrors(err, _req, res, next) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message,
        });
        return;
    }

    next(err);
}
