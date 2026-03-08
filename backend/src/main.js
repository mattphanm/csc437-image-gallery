import express from "express";
import path from "node:path";
import { getEnvVar } from "./getEnvVar.js";
import { SHARED_TEST } from "./shared/example.js";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const INDEX_PATH = path.resolve(STATIC_DIR, "index.html");
const app = express();
app.use(express.static(STATIC_DIR));

app.get("/hello", (req, res) => {
    res.send("Hello, World " + SHARED_TEST);
});

app.get(Object.values(VALID_ROUTES), (req, res) => {
    res.sendFile(INDEX_PATH);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
