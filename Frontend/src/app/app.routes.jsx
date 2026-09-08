import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register.jsx";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <h1>Amen</h1>
    }, 
    {
        path: "/register",
        element: <Register />
    }
])