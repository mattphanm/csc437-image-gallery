import { useEffect, useState } from "react";
import { ImageGrid } from "./ImageGrid.jsx";

export function AllImages({ authToken }) {
    const [imageData, setImageData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function doFetch() {
            try {
                const response = await fetch("/api/images", {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
                }

                const images = await response.json();
                if (!Array.isArray(images)) {
                    throw new Error("Error: expected an array of images.");
                }

                if (isMounted) {
                    setImageData(images);
                    setErrorMessage("");
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error instanceof Error ? error.message : String(error));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        doFetch();
        return () => {
            isMounted = false;
        };
    }, [authToken]);

    return (
        <>
            <h2>All Images</h2>
            {isLoading && <p>Loading...</p>}
            {errorMessage !== "" && <p>{errorMessage}</p>}
            {!isLoading && errorMessage === "" && <ImageGrid images={imageData} />}
        </>
    );
}
