import { useState } from "react";

export function ImageNameEditor({ imageId, initialValue, onNameUpdated, authToken }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(initialValue || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    function handleEditPressed() {
        setIsEditingName(true);
        setNameInput(initialValue || "");
        setErrorMessage("");
    }

    async function handleSubmitPressed() {
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    name: nameInput,
                }),
            });

            if (!response.ok) {
                let nextErrorMessage = `Error: HTTP ${response.status} ${response.statusText}`;
                const contentType = response.headers.get("content-type") || "";

                if (contentType.includes("application/json")) {
                    const errorData = await response.json();
                    if (errorData?.message) {
                        nextErrorMessage = errorData.message;
                    }
                } else {
                    const errorText = await response.text();
                    if (errorText !== "") {
                        nextErrorMessage = errorText;
                    }
                }

                throw new Error(nextErrorMessage);
            }

            onNameUpdated(nameInput);
            setIsEditingName(false);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : String(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name
                    <input
                        required
                        disabled={isSubmitting}
                        style={{ marginLeft: "0.5em" }}
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                    />
                </label>
                <button disabled={isSubmitting || nameInput.length === 0} onClick={handleSubmitPressed}>Submit</button>
                <button disabled={isSubmitting} onClick={() => setIsEditingName(false)}>Cancel</button>
                <div aria-live="polite">
                    {isSubmitting && <p>Renaming image...</p>}
                    {errorMessage !== "" && <p>{errorMessage}</p>}
                </div>
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={handleEditPressed}>Edit name</button>
            </div>
        );
    }
}
