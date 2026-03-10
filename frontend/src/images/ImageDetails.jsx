import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ImageNameEditor } from "./ImageNameEditor.tsx";

export function ImageDetails() {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function doFetch() {
            setIsLoading(true);
            setErrorMessage("");
            setImage(null);
            try {
                const response = await fetch(`/api/images/${imageId}`);
                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
                }

                const fetchedImage = await response.json();
                if (!fetchedImage || typeof fetchedImage !== "object" || Array.isArray(fetchedImage)) {
                    throw new Error("Error: expected one image object.");
                }

                if (isMounted) {
                    setImage(fetchedImage);
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
    }, [imageId]);

    if (isLoading) {
        return <p>Loading...</p>;
    }
    if (errorMessage !== "") {
        return <p>{errorMessage}</p>;
    }
    if (!image) {
        return <h2>Image not found</h2>;
    }

    function handleNameUpdated(updatedName) {
        setImage(currentImage => {
            if (!currentImage) {
                return currentImage;
            }

            return {
                ...currentImage,
                name: updatedName,
            };
        });
    }

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <ImageNameEditor
                imageId={image._id}
                initialValue={image.name}
                onNameUpdated={handleNameUpdated}
            />
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    )
}
