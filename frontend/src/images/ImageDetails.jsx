import { useState } from "react";
import { MainLayout } from "../MainLayout.jsx";
import { fetchById } from "./ImageFetcher.js";

export function ImageDetails({ imageId }) {
    const [image, _setImage] = useState(fetchById(imageId));
    if (!image) {
        return <MainLayout><h2>Image not found</h2></MainLayout>;
    }

    return (
        <MainLayout>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </MainLayout>
    )
}
