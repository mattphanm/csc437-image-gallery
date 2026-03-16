import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

export function verifyAuthToken(req, res, next) {
    const authHeader = req.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).end();
    }

    jwt.verify(token, getEnvVar("JWT_SECRET"), (error, decodedToken) => {
        if (decodedToken) {
            req.userInfo = decodedToken;
            return next();
        }
        return res.status(401).end();
    });
}
