import "./Header.css";
import { Link } from "react-router";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

export function Header() {
    return (
        <header>
            <h1>My cool image site</h1>
            <div>
                <label>
                    Some switch (dark mode?) <input type="checkbox" />
                </label>
                <nav>
                    <Link to={VALID_ROUTES.HOME}>Home</Link>
                    <Link to={VALID_ROUTES.UPLOAD}>Upload</Link>
                    <Link to={VALID_ROUTES.LOGIN}>Log in</Link>
                </nav>
            </div>
        </header>
    );
}
