import React from "react";
import { MainLayout } from "./MainLayout.jsx";
import "./LoginPage.css";

export function LoginPage() {
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();

    return (
        <MainLayout>
            <h2>Login</h2>
            <form className="LoginPage-form">
                <label htmlFor={usernameInputId}>Username</label>
                <input id={usernameInputId} required />

                <label htmlFor={passwordInputId}>Password</label>
                <input id={passwordInputId} type="password" required />

                <input type="submit" value="Submit" />
            </form>
        </MainLayout>
    );
}
