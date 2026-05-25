// components/annonce/AnnonceForm.tsx
import React, { useState } from 'react';
import { FiX, FiImage, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { annonceApi, type Annonce } from '../../services/api';

interface AnnonceFormProps {
    onClose: () => void;
    onCreated: (newAnnonce: Annonce) => void; // callback pour ajouter l'annonce à la liste sans recharger
}

const AnnonceForm: React.FC<AnnonceFormProps> = ({ onClose, onCreated }) => {
    const [titre, setTitre] = useState('');
    const [contenu, setContenu] = useState('');
    const [type, setType] = useState<Annonce['type']>('info');
    const [isPublic, setIsPublic] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('titre', titre);
            formData.append('contenu', contenu);
            formData.append('type', type);
            formData.append('is_public', String(isPublic));
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // Envoi via annonceApi.create (qui doit gérer FormData)
            const newAnnonce = await annonceApi.creer({
                titre,
                contenu,
                type,
                is_public: isPublic,
                image: imageFile ?? undefined, // File ou undefined
            });
            toast.success('Annonce créée avec succès !');
            onCreated(newAnnonce.annonce);
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
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6">📝 Nouvelle annonce</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Titre */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Titre</span>
                        </label>
                        <input
                            type="text"
                            value={titre}
                            onChange={(e) => setTitre(e.target.value)}
                            className="input input-bordered w-full"
                            required
                            placeholder="Ex: Nouveau service disponible"
                        />
                    </div>

                    {/* Contenu */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Contenu</span>
                        </label>
                        <textarea
                            value={contenu}
                            onChange={(e) => setContenu(e.target.value)}
                            className="textarea textarea-bordered w-full h-24"
                            required
                            placeholder="Détails de l'annonce..."
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Type</span>
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as Annonce['type'])}
                            className="select select-bordered w-full"
                        >
                            <option value="info">Info</option>
                            <option value="alerte">Alerte</option>
                            <option value="resultat">Résultat</option>
                            <option value="autre">Autre</option>
                        </select>
                    </div>

                    {/* Visibilité */}
                    <div className="flex items-center gap-3">
                        <label className="label cursor-pointer">
                            <span className="label-text font-medium mr-3">Publique</span>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="checkbox checkbox-primary"
                            />
                        </label>
                        <span className="text-sm text-gray-500">
                            {isPublic ? 'Visible par tous' : 'Visible par les administrateurs uniquement'}
                        </span>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="label"><span className="label-text font-medium">Image</span></label>
                        <div className="flex items-center gap-2">
                            <FiImage className="text-gray-400" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setImageFile(file);
                                }}
                                className="file-input file-input-bordered w-full"
                            />
                        </div>
                        {imageFile && <p className="text-xs text-gray-500 mt-1">{imageFile.name}</p>}
                    </div>

                    {/* Bouton submit */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <>
                                    <FiSend /> Publier
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnnonceForm;
