import { ObjectId } from "mongodb";
import { handleImageFileErrors, imageMiddlewareFactory } from "./imageUploadMiddleware.js";

const MAX_NAME_LENGTH = 100;

function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

export function registerImageRoutes(app, imageProvider) {
    app.post(
        "/api/images",
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        async (req, res) => {
            const uploadedFile = req.file;
            const imageName = req.body?.name;
            const authorId = req.userInfo?.username;

            if (!uploadedFile || typeof imageName !== "string" || imageName === "" || !authorId) {
                return res.status(400).send({
                    error: "Bad Request",
                    message: "Request must include image file and name",
                });
            }

            try {
                const imageId = await imageProvider.createImage({
                    src: `/uploads/${uploadedFile.filename}`,
                    name: imageName,
                    authorId,
                });
                return res.status(201).send({ id: imageId });
            } catch (error) {
                console.error("Failed to post /api/images", error);
                return res.status(500).send(String(error));
            }
        },
    );

    app.get("/api/images", async (req, res) => {
        try {
            await waitDuration(1000);
            const images = await imageProvider.getAllImages();
            return res.send(images);
        } catch (error) {
            console.error("Failed to fetch /api/images", error);
            return res.status(500).send(String(error));
        }
    });

    app.get("/api/images/:imageId", async (req, res) => {
        const { imageId } = req.params;
        if (!ObjectId.isValid(imageId)) {
            return res.status(404).send({
                error: "Not Found",
                message: "No image with that ID"
            });
        }

        try {
            const image = await imageProvider.getOneImage(imageId);
            if (!image) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "No image with that ID"
                });
            }
            return res.send(image);
        } catch (error) {
            console.error("Failed to fetch /api/images/:imageId", error);
            return res.status(500).send(String(error));
        }
    });

    app.patch("/api/images/:imageId", async (req, res) => {
        const { imageId } = req.params;
        if (!ObjectId.isValid(imageId)) {
            return res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }

        const newName = req.body?.name;
        if (typeof newName !== "string") {
            return res.status(400).send({
                error: "Bad Request",
                message: "Request body must include a string field named 'name'"
            });
        }
        if (newName.length > MAX_NAME_LENGTH) {
            return res.status(413).send({
                error: "Content Too Large",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
            });
        }

        try {
            const imageAuthorId = await imageProvider.getImageAuthorId(imageId);
            if (!imageAuthorId) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            const loggedInUsername = req.userInfo?.username;
            if (loggedInUsername !== imageAuthorId) {
                return res.status(403).send({
                    error: "Forbidden",
                    message: "This user does not own this image"
                });
            }

            const matchedCount = await imageProvider.updateImageName(imageId, newName);
            if (matchedCount === 0) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }
            return res.status(204).send();
        } catch (error) {
            console.error("Failed to patch /api/images/:imageId", error);
            return res.status(500).send(String(error));
        }
    });
}
