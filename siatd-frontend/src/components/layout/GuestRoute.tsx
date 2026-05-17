import { Navigate, Outlet } from 'react-router-dom';

export const GuestRoute = () => {
    const token = localStorage.getItem('token');

    // Si YA TIENE token, lo pateamos de vuelta al Dashboard
    if (token) {
        return <Navigate to="/" replace />;
    }

    // Si NO tiene token, lo dejamos ver el Login/Register
    return <Outlet />;
};