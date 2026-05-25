// pages/ListeSessions.tsx
import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { sessionApi, type Session } from '../../services/api';
import SessionCard from '../../components/sessions/sessionCard';
import SessionForm from '../../components/sessions/sessionForm';

const ListeSessions: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editSession, setEditSession] = useState<Session | null>(null);
    const [deleteSession, setDeleteSession] = useState<Session | null>(null);

    const fetchSessions = async () => {
        try {
            const data = await sessionApi.liste();
            setSessions(data);
        } catch {
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSessions(); }, []);

    const handleSaved = (s: Session) => {
        setSessions(prev => {
            const exists = prev.find(x => x.id === s.id);
            if (exists) return prev.map(x => x.id === s.id ? s : x);
            return [s, ...prev];
        });
    };

    const handleDelete = async () => {
        if (!deleteSession) return;
        try {
            await sessionApi.supprimer(deleteSession.id);
            setSessions(prev => prev.filter(s => s.id !== deleteSession.id));
            toast.success('Session supprimée');
        } catch {
            toast.error('Erreur');
        } finally {
            setDeleteSession(null);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Sessions</h1>
                <button className="btn btn-primary gap-2" onClick={() => setShowForm(true)}>
                    <FiPlus /> Nouvelle session
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map(s => (
                    <SessionCard
                        key={s.id}
                        session={s}
                        onEdit={(s) => setEditSession(s)}
                        onDelete={(s) => setDeleteSession(s)}
                    />
                ))}
                {sessions.length === 0 && <p className="col-span-full text-center text-gray-500">Aucune session</p>}
            </div>

            {/* Formulaire création */}
            {showForm && <SessionForm onClose={() => setShowForm(false)} onSaved={handleSaved} />}

            {/* Formulaire édition */}
            {editSession && (
                <SessionForm
                    session={editSession}
                    onClose={() => setEditSession(null)}
                    onSaved={handleSaved}
                />
            )}

            {/* Confirmation suppression */}
            {deleteSession && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
                        <h3 className="font-bold text-lg">Supprimer "{deleteSession.nom}" ?</h3>
                        <p className="py-4">Toutes les notes liées à cette session seront également supprimées.</p>
                        <div className="flex justify-end gap-3">
                            <button className="btn btn-ghost" onClick={() => setDeleteSession(null)}>Annuler</button>
                            <button className="btn btn-error" onClick={handleDelete}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListeSessions;
