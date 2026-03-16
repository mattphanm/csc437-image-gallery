import React from "react";
import { Link, useNavigate } from "react-router";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";
import "./LoginPage.css";

function getErrorMessageFromResponse(status, jsonBody, isRegistering) {
    if (isRegistering && status === 409) {
        return "That username is already taken. Please choose a different username.";
    }
    if (!isRegistering && status === 401) {
        return "Incorrect username or password.";
    }
    return jsonBody?.message || `Request failed with status ${status}.`;
}

async function parseJsonIfPresent(response) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return response.json();
    }
    return null;
}

export function LoginPage({ isRegistering = false, onAuthTokenReceived }) {
    const usernameInputId = React.useId();
    const emailInputId = React.useId();
    const passwordInputId = React.useId();
    const navigate = useNavigate();
    const [resultMessage, formAction, isPending] = React.useActionState(
        async (_previousResult, formData) => {
            const username = String(formData.get("username") || "");
            const email = String(formData.get("email") || "");
            const password = String(formData.get("password") || "");

            const endpoint = isRegistering ? "/api/users" : "/api/auth/tokens";
            const body = isRegistering
                ? { username, email, password }
                : { username, password };

            let response;
            try {
                response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });
            } catch {
                return "Unable to reach the server. Please try again.";
            }

            const jsonBody = await parseJsonIfPresent(response);
            if (!response.ok) {
                return getErrorMessageFromResponse(response.status, jsonBody, isRegistering);
            }

            const token = jsonBody?.token;
            if (typeof token !== "string" || token === "") {
                return "Authentication succeeded but no token was returned.";
            }

            if (isRegistering) {
                console.log("Successfully created account");
            } else {
                console.log(token);
            }

            if (typeof onAuthTokenReceived === "function") {
                onAuthTokenReceived(token);
            }
            navigate(VALID_ROUTES.HOME);
            return "";
        },
        "",
    );

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" action={formAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input id={usernameInputId} name="username" required disabled={isPending} />

                {isRegistering && (
                    <>
                        <label htmlFor={emailInputId}>Email</label>
                        <input id={emailInputId} name="email" type="email" required disabled={isPending} />
                    </>
                )}

                <label htmlFor={passwordInputId}>Password</label>
                <input id={passwordInputId} name="password" type="password" required disabled={isPending} />

                <input type="submit" value={isRegistering ? "Register" : "Login"} disabled={isPending} />
            </form>
            <div aria-live="polite">
                {resultMessage !== "" && <p>{resultMessage}</p>}
            </div>
            <p>
                {isRegistering ? "Already have an account? " : "Don't have an account? "}
                <Link to={isRegistering ? VALID_ROUTES.LOGIN : VALID_ROUTES.REGISTER}>
                    {isRegistering ? "Login here" : "Register here"}
                </Link>
            </p>
        </>
    );
}
