import { useState, useEffect } from 'react';
import { Settings, Brain, Sliders, Save, Database, ShieldAlert, Loader2 } from 'lucide-react';
import { api } from '../../api/axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const SystemSettings = () => {
    const { t } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [settings, setSettings] = useState({
        topsisThreshold: 85,
        strictNormalization: true,
        aiSystemPrompt: "",
        aiModel: "Gemini 2.5 Flash"
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/admin/settings');
                setSettings(response.data);
            } catch (error) {
                console.error("Error al cargar configuraciones", error);
                toast.error(t('admin.saveError'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/admin/settings', settings);
            toast.success(t('admin.saveSuccess'));
        } catch (error) {
            console.error("Error al guardar", error);
            toast.error(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePurgeDrafts = async () => {
        if (confirm(t('admin.purgeConfirm'))) {
            try {
                toast.success(t('admin.purgeSuccess'));
            } catch (error) {
                console.error(error);
                toast.error(t('admin.purgeError'));
            }
        }
    };

    const handleExportExcel = async () => {
        const toastId = toast.loading(t('admin.exportLoading'));
        try {
            const response = await api.get('/admin/export/excel', { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'SIATD_Auditoria_Decisiones.xlsx');
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(t('admin.exportSuccess'), { id: toastId });
        } catch (error) {
            console.error("Error exportando excel", error);
            toast.error(t('admin.exportError'), { id: toastId });
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-64 transition-colors duration-200">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">{t('admin.loadingSettings')}</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 mb-20 transition-colors duration-200">
            <div className="flex justify-between items-end mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-800 dark:bg-indigo-500/20 p-3 rounded-2xl text-white dark:text-indigo-400 transition-colors">
                        <Settings className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t('admin.systemSettingsTitle')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.systemSettingsSub')}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-70"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? t('admin.saving') : t('admin.save')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                            <Sliders className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> {t('admin.topsisParams')}
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                                    <span>{t('admin.confidenceThreshold')}</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">{settings.topsisThreshold}%</span>
                                </label>
                                <input
                                    type="range"
                                    name="topsisThreshold"
                                    min="50" max="100"
                                    value={settings.topsisThreshold}
                                    onChange={handleChange}
                                    className="w-full accent-indigo-600 dark:accent-indigo-500"
                                />
                            </div>

                            <hr className="border-slate-100 dark:border-slate-700" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200">{t('admin.strictNormalization')}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('admin.strictNormDesc')}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="strictNormalization"
                                        checked={settings.strictNormalization}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-slate-900 p-8 rounded-3xl shadow-xl text-white transition-colors">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-200">
                            <Brain className="w-5 h-5" /> {t('admin.aiRules')}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">{t('admin.systemPrompt')}</label>
                                <textarea
                                    name="aiSystemPrompt"
                                    value={settings.aiSystemPrompt}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 dark:bg-slate-900/50 border border-slate-700 dark:border-slate-600 rounded-xl p-4 text-sm text-slate-300 outline-none focus:border-indigo-500 h-32 resize-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">{t('admin.model')}</label>
                                <select
                                    name="aiModel"
                                    value={settings.aiModel}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-600 rounded-xl p-3 text-slate-300 outline-none transition-colors cursor-pointer"
                                >
                                    <option value="Gemini 2.5 Flash">{t('admin.modelActive')}</option>
                                    <option value="Gemini Pro">Gemini Pro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                            <Database className="w-5 h-5 text-slate-400 dark:text-slate-500" /> {t('admin.maintenance')}
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleExportExcel}
                                className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-600 transition-colors"
                            >
                                {t('admin.exportExcel')}
                            </button>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-3xl border border-red-100 dark:border-red-500/20 transition-colors">
                        <h3 className="font-bold text-red-800 dark:text-red-400 flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-500" /> {t('admin.dangerZone')}
                        </h3>
                        <p className="text-xs text-red-600 dark:text-red-400/80 mb-4">{t('admin.dangerDesc')}</p>
                        <button
                            onClick={handlePurgeDrafts}
                            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 dark:shadow-none transition-colors"
                        >
                            {t('admin.purgeDrafts')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
