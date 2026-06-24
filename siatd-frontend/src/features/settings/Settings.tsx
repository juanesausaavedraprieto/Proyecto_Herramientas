import { useState, useEffect } from 'react';
import { Moon, Sun, Shield, User, Bell, ChevronDown, ChevronRight, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useTranslation } from 'react-i18next';

export const Settings = () => {
    const { t } = useTranslation();
    const [isDark, setIsDark] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const { notifications, removeNotification, clearAll } = useNotificationStore();

    useEffect(() => {
        const isDarkStored = document.documentElement.classList.contains('dark') ||
            localStorage.getItem('theme') === 'dark';
        setIsDark(isDarkStored);
    }, []);

    const toggleDarkMode = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 min-h-screen transition-colors duration-300 animate-in fade-in duration-500">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-8">{t('settings.title')}</h1>

            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-colors ${isDark ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white">{t('settings.darkMode')}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.darkModeDesc')}</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`w-14 h-8 flex items-center rounded-full p-1 duration-300 ease-in-out ${isDark ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${isDark ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all hover:border-blue-200 dark:hover:border-blue-900">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-2xl">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white">{t('settings.profile')}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.profileDesc')}</p>
                        </div>
                    </div>
                    <Link to="/profile" className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline flex items-center gap-1">
                        {t('settings.edit')}
                    </Link>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className="relative bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-2xl">
                                <Bell className="w-6 h-6" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
                                        {notifications.length}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">{t('settings.notifications')}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.notificationsDesc')}</p>
                            </div>
                        </div>
                        {showNotifications ? <ChevronDown className="text-slate-400 w-5 h-5" /> : <ChevronRight className="text-slate-400 w-5 h-5" />}
                    </button>

                    {showNotifications && (
                        <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-700 pt-4 bg-slate-50/50 dark:bg-slate-900/20 animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">{t('settings.recentAlerts')}</h4>
                                {notifications.length > 0 && (
                                    <button onClick={clearAll} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1">
                                        <Trash2 className="w-3 h-3" /> {t('settings.clearAll')}
                                    </button>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 py-6">{t('settings.noAlerts')}</p>
                            ) : (
                                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {notifications.map((notif) => (
                                        <li key={notif.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                                            <button
                                                onClick={() => removeNotification(notif.id)}
                                                className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <p className="text-xs text-slate-400 mb-1 font-medium">{notif.date}</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 pr-4">{notif.message}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white">{t('settings.security')}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.securityDesc')}</p>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-400 w-5 h-5" />
                </div>
            </div>

            <p className="mt-12 text-center text-slate-400 text-xs">
                {t('settings.version')}
            </p>
        </div>
    );
};
