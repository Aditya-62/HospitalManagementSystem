import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");

    // IF TOKEN NOT FOUND
    if (!token) {

        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;