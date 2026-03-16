import { useState } from "react";
import { AllImages } from "./images/AllImages.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { MainLayout } from "./MainLayout.jsx";
import { Route, Routes } from "react-router";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

function App() {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem("authToken") || "");

    function handleAuthTokenReceived(token) {
        setAuthToken(token);
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    }

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route
                    path={VALID_ROUTES.HOME}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <AllImages authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={VALID_ROUTES.IMAGE_DETAILS}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ImageDetails authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={VALID_ROUTES.UPLOAD}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <UploadPage authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={VALID_ROUTES.LOGIN}
                    element={<LoginPage isRegistering={false} onAuthTokenReceived={handleAuthTokenReceived} />}
                />
                <Route
                    path={VALID_ROUTES.REGISTER}
                    element={<LoginPage isRegistering={true} onAuthTokenReceived={handleAuthTokenReceived} />}
                />
            </Route>
        </Routes>
    );
}

export default App;
