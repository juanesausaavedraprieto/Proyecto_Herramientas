import { useNavigate } from 'react-router-dom';
import { MapPinOff, ArrowLeft, Home } from 'lucide-react';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-xl border border-slate-100">
                <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                    <MapPinOff className="w-12 h-12 text-red-500 transform -rotate-12" />
                </div>
                
                <h1 className="text-6xl font-black text-slate-800 mb-4">404</h1>
                <h2 className="text-xl font-bold text-slate-700 mb-2">Ruta Desconocida</h2>
                <p className="text-slate-500 mb-8">
                    Parece que te has perdido en el ciberespacio. La página que buscas no existe o fue movida.
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" /> Regresar
                    </button>
                    <button 
                        onClick={() => navigate('/')} 
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        <Home className="w-5 h-5" /> Ir al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
};