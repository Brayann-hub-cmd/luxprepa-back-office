// components/matiere/MatiereForm.tsx
import React, { useState } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { matiereApi, type Matiere } from '../../services/api';

interface MatiereFormProps {
    matiere?: Matiere; // si défini, mode édition
    onClose: () => void;
    onSaved: (m: Matiere) => void;
}

const MatiereForm: React.FC<MatiereFormProps> = ({ matiere, onClose, onSaved }) => {
    const [nom, setNom] = useState(matiere?.nom || '');
    const [description, setDescription] = useState(matiere?.description);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (matiere) {
                const res = await matiereApi.modifier(matiere.id, { nom, description });
                toast.success('Matière modifiée');
                onSaved(res.matiere);
            } else {
                const res = await matiereApi.creer({ nom, description });
                toast.success('Matière créée');
                onSaved(res.matiere);
            }
            onClose();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message)
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400"><FiX size={24} /></button>
                <h2 className="text-xl font-bold mb-4 text-black">{matiere ? 'Modifier' : 'Nouvelle'} matière</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label"><span className="label-text text-gray-500">Nom *</span></label>
                        <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className="input input-bordered w-full" />
                    </div>
                    <div>
                        <label className="label"><span className="label-text text-gray-500">Description</span></label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered w-full" rows={3} />
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

export default MatiereForm;
