import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import AnnonceCard from '../../components/annonce/annonceCard';
import AnnonceForm from '../../components/annonce/annonceForm';
import AnnonceDetailModal from '../../components/annonce/annonceDetail';
import AnnonceEditForm from '../../components/annonce/annonceEdit';
import ConfirmModal from '../../components/confirmModal';
import { type Annonce, annonceApi } from '../../services/api';

const ListeAnnonces: React.FC = () => {
    const [annonces, setAnnonces] = useState<Annonce[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [showForm, setShowForm] = useState(false)
    const [detailAnnonce, setDetailAnnonce] = useState<Annonce | null>(null);
    const [editAnnonce, setEditAnnonce] = useState<Annonce | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Annonce | null>(null);

    const fetchAnnonces = useCallback(async () => {
        try {
            const response = await annonceApi.liste();
            setAnnonces(response);
        } catch (error) {
            if (error instanceof Error) toast.error(error.message)
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnonces();
    }, [fetchAnnonces]);

    const handleCreated = (newAnnonce: Annonce) => {
        setAnnonces((prev) => [newAnnonce, ...prev]);
    };
    const handleUpdated = (updated: Annonce) => {
        setAnnonces(prev => prev.map(a => a.id === updated.id ? updated : a));
    };
    const handleDeleteRequest = (annonce: Annonce) => {
        setConfirmDelete(annonce);
    };

    const confirmDeleteAction = async () => {
        if (!confirmDelete) return;
        try {
            await annonceApi.supprimer(confirmDelete.id);
            toast.success('Annonce supprimée');
            setAnnonces(prev => prev.filter(a => a.id !== confirmDelete.id));
        } catch (err) {
            toast.error('Erreur lors de la suppression');
        } finally {
            setConfirmDelete(null);
        }
    };
    // Filtrer
    const filtered = annonces.filter((a) => {
        const matchTitre = a.titre.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === '' || a.type === filterType;
        return matchTitre && matchType;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <ClipLoader color="#22c55e" size={60} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-400">Annonces</h1>
                <button
                    className="btn btn-primary gap-2"
                    onClick={() => setShowForm(true)}
                >
                    <FiPlus /> Nouvelle annonce
                </button>
            </div>
            {/* Filtres */}
            <div className="card bg-base-100 shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="input input-bordered flex items-center gap-2 flex-1">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Rechercher par titre..."
                            className="grow"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="select select-bordered w-full sm:w-48"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">Tous les types</option>
                        <option value="info">Info</option>
                        <option value="alerte">Alerte</option>
                        <option value="resultat">Résultat</option>
                        <option value="autre">Autre</option>
                    </select>

                    <button className="btn btn-primary" onClick={() => { setSearch(''); setFilterType(''); }}>
                        <FiFilter /> Réinitialiser
                    </button>
                </div>
            </div>

            {/* Grille */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Aucune annonce trouvée.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map((annonce) => (
                        <AnnonceCard key={annonce.id} annonce={annonce} onDetail={(a) => setDetailAnnonce(a)} onEdit={(a) => setEditAnnonce(a)} onDelete={handleDeleteRequest} />
                    ))}
                </div>
            )}

            {/* Pagination (exemple avec DaisyUI join) */}
            {filtered.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <div className="join">
                        <button className="join-item btn btn-outline">«</button>
                        <button className="join-item btn btn-primary">1</button>
                        <button className="join-item btn btn-outline">2</button>
                        <button className="join-item btn btn-outline">3</button>
                        <button className="join-item btn btn-outline">»</button>
                    </div>
                </div>
            )}
            {showForm && (
                <AnnonceForm
                    onClose={() => setShowForm(false)}
                    onCreated={handleCreated}
                />
            )}
            {detailAnnonce && (
                <AnnonceDetailModal
                    annonce={detailAnnonce}
                    onClose={() => setDetailAnnonce(null)}
                />
            )}
            {editAnnonce && (
                <AnnonceEditForm
                    annonce={editAnnonce}
                    onClose={() => setEditAnnonce(null)}
                    onUpdated={handleUpdated}
                />
            )}
            {confirmDelete && (
                <ConfirmModal
                    title="Confirmation de suppression"
                    message={`Supprimer l'annonce "${confirmDelete.titre}" ?`}
                    onConfirm={confirmDeleteAction}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
        </div>
    );
};

export default ListeAnnonces;
