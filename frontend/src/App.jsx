import { AllImages } from "./images/AllImages.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { MainLayout } from "./MainLayout.jsx";
import { Route, Routes } from "react-router";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path={VALID_ROUTES.HOME} element={<AllImages />} />
                <Route path={VALID_ROUTES.IMAGE_DETAILS} element={<ImageDetails />} />
                <Route path={VALID_ROUTES.UPLOAD} element={<UploadPage />} />
                <Route path={VALID_ROUTES.LOGIN} element={<LoginPage />} />
            </Route>
        </Routes>
    );
}

export default App;
