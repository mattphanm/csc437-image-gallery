import { useState } from "react";
import { fetchAll } from "./ImageFetcher.js";
import { ImageGrid } from "./ImageGrid.jsx";

export function AllImages() {
    const [imageData, _setImageData] = useState(fetchAll);
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={imageData} />
        </>
    );
}
