import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Note:
// this component is used to protect private routes in the application.
// it checks whether the user is authenticated using `isLoggedIn()`. isVerified will be adding soon.
// if the user is not logged in, they are redirected to the login page.
// the `replace` prop prevents the user from navigating back
// to the protected page using the browser's back button.
// if the user is authenticated, the wrapped child component is rendered.
