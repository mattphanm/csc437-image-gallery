import express from "express";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { getEnvVar } from "./getEnvVar.js";
import { SHARED_TEST } from "./shared/example.js";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";
import { connectMongo } from "./connectMongo.js";
import { ImageProvider } from "./ImageProvider.js";
import { CredentialsProvider } from "./CredentialsProvider.js";
import { registerImageRoutes } from "./routes/imageRoutes.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { verifyAuthToken } from "./routes/authMiddleware.js";

const mongoClient = connectMongo();
await mongoClient.connect();
const imageProvider = new ImageProvider(mongoClient);
const credentialsProvider = new CredentialsProvider(mongoClient);

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const IMAGE_UPLOAD_DIR = path.resolve(getEnvVar("IMAGE_UPLOAD_DIR", false) || "uploads");
const INDEX_PATH = path.resolve(STATIC_DIR, "index.html");

try {
    await mkdir(IMAGE_UPLOAD_DIR, { recursive: true });
} catch (error) {
    console.error(`Failed to create image upload directory at ${IMAGE_UPLOAD_DIR}`, error);
    process.exit(1);
}

const app = express();
app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(IMAGE_UPLOAD_DIR));
app.use(express.json());

app.get("/api/hello", (req, res) => {
    res.send("Hello, World " + SHARED_TEST);
});
registerAuthRoutes(app, credentialsProvider);
app.use("/api/images", verifyAuthToken);
registerImageRoutes(app, imageProvider);

app.get(Object.values(VALID_ROUTES), (req, res) => {
    res.sendFile(INDEX_PATH);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
