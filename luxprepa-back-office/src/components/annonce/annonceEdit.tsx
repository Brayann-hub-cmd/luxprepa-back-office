// components/annonce/AnnonceEditForm.tsx
import React, { useState } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { annonceApi, type Annonce } from '../../services/api';

interface AnnonceEditFormProps {
    annonce: Annonce;
    onClose: () => void;
    onUpdated: (updated: Annonce) => void;
}

const AnnonceEditForm: React.FC<AnnonceEditFormProps> = ({ annonce, onClose, onUpdated }) => {
    const [titre, setTitre] = useState(annonce.titre);
    const [contenu, setContenu] = useState(annonce.contenu);
    const [type, setType] = useState(annonce.type);
    const [isPublic, setIsPublic] = useState(annonce.is_public);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await annonceApi.modifier(annonce.id, {
                titre,
                contenu,
                type,
                is_public: isPublic,
            });
            toast.success('Annonce modifiée !');
            onUpdated(response.annonce);
            onClose();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message)
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                <h2 className="text-2xl font-bold text-green-400 mb-6"> Modifier l'annonce</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Titre */}
                    <div>
                        <label className="label"><span className="label-text text-green-300 font-medium">Titre</span></label>
                        <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} className="input input-bordered w-full" required />
                    </div>
                    {/* Contenu */}
                    <div>
                        <label className="label"><span className="label-text text-green-300 font-medium">Contenu</span></label>
                        <textarea value={contenu} onChange={(e) => setContenu(e.target.value)} className="textarea textarea-bordered w-full h-24" required />
                    </div>
                    {/* Type */}
                    <div>
                        <label className="label"><span className="label-text text-green-300 font-medium">Type</span></label>
                        <select value={type} onChange={(e) => setType(e.target.value as Annonce['type'])} className="select select-bordered w-full">
                            <option value="info">Info</option>
                            <option value="alerte">Alerte</option>
                            <option value="resultat">Résultat</option>
                            <option value="autre">Autre</option>
                        </select>
                    </div>
                    {/* Visibilité */}
                    <div className="flex items-center gap-3">
                        <label className="label cursor-pointer"><span className="label-text text-green-300 font-medium mr-3">Publique</span>
                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="checkbox checkbox-primary" />
                        </label>
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" className="btn btn-ghost text-gray-400" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? <span className="loading loading-spinner loading-sm"></span> : <><FiSend /> Enregistrer</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnnonceEditForm;
