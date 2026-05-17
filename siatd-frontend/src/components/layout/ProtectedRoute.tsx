import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const ProtectedRoute = () => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    // Si no hay token, lo mandamos al login, pero guardamos a dónde quería ir
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si hay token, lo dejamos pasar a la ruta "hija" (Outlet)
    return <Outlet />;
};