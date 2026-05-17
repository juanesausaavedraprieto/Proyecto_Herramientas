import { Navigate, Outlet } from 'react-router-dom';

export const AdminRoute = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token) return <Navigate to="/login" replace />;

    // Si no es ADMIN, lo devolvemos al Dashboard normal de estudiante
    if (role !== 'ADMIN') return <Navigate to="/" replace />;

    return <Outlet />;
};