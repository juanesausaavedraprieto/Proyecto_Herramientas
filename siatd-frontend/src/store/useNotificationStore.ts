import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppNotification {
    id: string;
    message: string;
    date: string;
}

interface NotificationStore {
    notifications: AppNotification[];
    addNotification: (message: string) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set) => ({
            notifications: [],
            // Agregar una nueva notificación al principio de la lista
            addNotification: (message) => set((state) => ({
                notifications: [
                    { id: crypto.randomUUID(), message, date: new Date().toLocaleString() },
                    ...state.notifications
                ]
            })),
            // Eliminar una específica
            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter(n => n.id !== id)
            })),
            // Limpiar todo
            clearAll: () => set({ notifications: [] }),
        }),
        {
            name: 'siatd-notifications', // Se guarda en localStorage
        }
    )
);