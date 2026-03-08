import "./Images.css";
import { Link } from "react-router";
import { VALID_ROUTES } from "../shared/ValidRoutes.js";

export function ImageGrid(props) {
    const imageElements = props.images.map((image) => (
        <div key={image.id} className="ImageGrid-photo-container">
            <Link to={VALID_ROUTES.IMAGE_DETAILS.replace(":imageId", image.id)}>
                <img src={image.src} alt={image.name}/>
            </Link>
        </div>
    ));
    return (
        <div className="ImageGrid">
            {imageElements}
        </div>
    );
}
