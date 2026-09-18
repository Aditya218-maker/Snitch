import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
import CreateProduct from "../features/products/pages/CreateProduct.jsx";
import Dashboard from "../features/products/pages/Dashboard.jsx";
import Protected from "../features/auth/components/Protected.jsx";
import Home from "../features/products/pages/Home.jsx";


export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    }, 
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/seller",
        //perform nesting as we will have multiple APIs starting with /seller
        children : [
            {
                path: "/seller/create-product",
                element: <Protected role="seller" ><CreateProduct /></Protected>
            },
            {
                path: "/seller/dashboard",
                element: <Protected role="seller"><Dashboard /></Protected>
            }
        ]
    }
])

