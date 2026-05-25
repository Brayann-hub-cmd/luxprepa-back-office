// components/session/SessionForm.tsx
import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { sessionApi, concoursApi, type Session, type Concours } from '../../services/api';

interface SessionFormProps {
    session?: Session;
    onClose: () => void;
    onSaved: (s: Session) => void;
}

const SessionForm: React.FC<SessionFormProps> = ({ session, onClose, onSaved }) => {
    const [nom, setNom] = useState(session?.nom || '');
    const [date, setDate] = useState(session?.date ? session.date.split('T')[0] : '');
    const [concoursId, setConcoursId] = useState<string>('');
    const [concoursList, setConcoursList] = useState<Concours[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Charger la liste des concours
        concoursApi.liste()
            .then(data => {
                setConcoursList(data);
                if (session?.concours_nom) {
                    const found = data.find(c => c.nom === session.concours_nom);
                    if (found) setConcoursId(found.id);
                }
            })
            .catch(() => toast.error('Erreur chargement concours'));
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!concoursId) {
            toast.error('Veuillez sélectionner un concours');
            return;
        }
        setSubmitting(true);
        try {
            if (session) {
                // Mode édition
                const res = await sessionApi.modifier(session.id, { nom, date: date || undefined, concours_id: concoursId });
                toast.success('Session modifiée');
                onSaved(res.session);
            } else {
                // Mode création
                const res = await sessionApi.creer({ nom, date: date || undefined, concours_id: concoursId });
                toast.success('Session créée');
                onSaved(res.session);
            }
            onClose();
        } catch (error) {
            toast.error('Erreur');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400"><FiX size={24} /></button>
                <h2 className="text-xl font-bold mb-4">{session ? 'Modifier' : 'Nouvelle'} session</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label"><span className="label-text">Nom *</span></label>
                        <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className="input input-bordered w-full" />
                    </div>
                    <div>
                        <label className="label"><span className="label-text">Date (optionnelle)</span></label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input input-bordered w-full" />
                    </div>
                    <div>
                        <label className="label"><span className="label-text">Concours *</span></label>
                        <select value={concoursId} onChange={(e) => setConcoursId(e.target.value)} className="select select-bordered w-full" required>
                            <option value="">Sélectionner un concours</option>
                            {concoursList.map(c => (
                                <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? <span className="loading loading-spinner loading-sm"></span> : <><FiSave /> Enregistrer</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SessionForm;
