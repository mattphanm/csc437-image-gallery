import React from "react";
import { useNavigate } from "react-router";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export function UploadPage({ authToken }) {
    const navigate = useNavigate();
    const fileInputId = React.useId();
    const nameInputId = React.useId();
    const [previewSrc, setPreviewSrc] = React.useState("");
    const [previewAlt, setPreviewAlt] = React.useState("");
    const [resultMessage, formAction, isPending] = React.useActionState(
        async (_previousState, formData) => {
            let response;
            try {
                response = await fetch("/api/images", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: formData,
                });
            } catch {
                setPreviewSrc("");
                return "Unable to upload right now. Please try again.";
            }

            if (!response.ok) {
                setPreviewSrc("");
                setPreviewAlt("");

                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    const errorData = await response.json();
                    if (typeof errorData?.message === "string" && errorData.message !== "") {
                        return errorData.message;
                    }
                }
                return `Upload failed with status ${response.status}.`;
            }

            const responseJson = await response.json();
            const createdImageId = responseJson?.id;
            if (typeof createdImageId !== "string" || createdImageId === "") {
                return "Upload succeeded but image ID was missing.";
            }

            navigate(VALID_ROUTES.IMAGE_DETAILS.replace(":imageId", createdImageId));
            return "";
        },
        "",
    );

    async function handleFileChange(event) {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            setPreviewSrc("");
            return;
        }

        try {
            const dataUrl = await readAsDataURL(selectedFile);
            setPreviewSrc(typeof dataUrl === "string" ? dataUrl : "");
        } catch {
            setPreviewSrc("");
        }
    }

    function handleNameChange(event) {
        setPreviewAlt(event.target.value);
    }

    return (
        <>
            <h2>Upload</h2>
            <form action={formAction}>
                <div>
                    <label htmlFor={fileInputId}>Choose image to upload: </label>
                    <input
                        id={fileInputId}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        onChange={handleFileChange}
                        disabled={isPending}
                    />
                </div>
                <div>
                    <label htmlFor={nameInputId}>Image title: </label>
                    <input
                        id={nameInputId}
                        name="name"
                        required
                        disabled={isPending}
                        onChange={handleNameChange}
                    />
                </div>

                <div>
                    {previewSrc !== "" && (
                        <img style={{ width: "20em", maxWidth: "100%" }} src={previewSrc} alt={previewAlt} />
                    )}
                </div>

                <input type="submit" value="Confirm upload" disabled={isPending} />
            </form>
            <div aria-live="polite">
                {resultMessage !== "" && <p>{resultMessage}</p>}
            </div>
        </>
    );
}
