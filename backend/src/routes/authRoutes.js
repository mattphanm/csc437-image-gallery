import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        const payload = { username };
        jwt.sign(
            payload,
            getEnvVar("JWT_SECRET"),
            { expiresIn: "1d" },
            (error, token) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(token);
                }
            },
        );
    });
}

function hasRequiredRegistrationFields(body) {
    return (
        typeof body?.username === "string"
        && typeof body?.email === "string"
        && typeof body?.password === "string"
    );
}

function hasRequiredLoginFields(body) {
    return typeof body?.username === "string" && typeof body?.password === "string";
}

export function registerAuthRoutes(app, credentialsProvider) {
    app.post("/api/users", async (req, res) => {
        if (!hasRequiredRegistrationFields(req.body)) {
            return res.status(400).send({
                error: "Bad request",
                message: "Missing username, email, or password",
            });
        }

        const { username, email, password } = req.body;

        try {
            const wasCreated = await credentialsProvider.registerUser(username, email, password);
            if (!wasCreated) {
                return res.status(409).send({
                    error: "Conflict",
                    message: "Username already taken",
                });
            }
            const token = await generateAuthToken(username);
            return res.status(201).send({ token });
        } catch (error) {
            console.error("Failed to create user at /api/users", error);
            return res.status(500).send(String(error));
        }
    });

    app.post("/api/auth/tokens", async (req, res) => {
        if (!hasRequiredLoginFields(req.body)) {
            return res.status(400).send({
                error: "Bad Request",
                message: "Missing username or password",
            });
        }

        const { username, password } = req.body;

        try {
            const isValid = await credentialsProvider.verifyPassword(username, password);
            if (!isValid) {
                return res.status(401).send({
                    error: "Unauthorized",
                    message: "Invalid username or password",
                });
            }

            const token = await generateAuthToken(username);
            return res.status(200).send({ token });
        } catch (error) {
            console.error("Failed to create token at /api/auth/tokens", error);
            return res.status(500).send(String(error));
        }
    });
}
