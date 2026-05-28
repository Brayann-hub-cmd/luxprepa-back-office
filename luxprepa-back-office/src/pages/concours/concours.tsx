// pages/ConcoursPage.tsx
import { useState, useEffect } from 'react';
import { FiPlus, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { concoursApi, type Concours } from '../../services/api';
import ConcoursCard from '../../components/concours/concourCard';
import ConcoursForm from '../../components/concours/concoursForm';
import { tokenUtils, type User } from '../../services/api';
const ConcoursPage = () => {
  const user = tokenUtils.getUser() as User
  const isAdmin = user.role === 'admin';
  const [concoursList, setConcoursList] = useState<Concours[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editConcours, setEditConcours] = useState<Concours | null>(null);
  const [deleteConcours, setDeleteConcours] = useState<Concours | null>(null);

  const fetchConcours = async () => {
    try {
      const data = await concoursApi.liste();
      setConcoursList(data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConcours(); }, []);

  const handleSaved = (c: Concours) => {
    setConcoursList(prev => {
      const idx = prev.findIndex(x => x.id === c.id);
      if (idx >= 0) {
        const newList = [...prev];
        newList[idx] = c;
        return newList;
      }
      return [c, ...prev];
    });
  };

  const handleDelete = async () => {
    if (!deleteConcours) return;
    try {
      await concoursApi.supprimer(deleteConcours.id);
      setConcoursList(prev => prev.filter(c => c.id !== deleteConcours.id));
      toast.success('Concours supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteConcours(null);
    }
  };

  const handleViewInscriptions = (concours: Concours) => {
    // rediriger vers la page des inscriptions filtrée par concours
    // ou afficher un modal
    toast(`Inscriptions pour "${concours.nom}" : ${concours.nombre_inscrits || 0}`);
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><FiList /> Concours</h1>
        {isAdmin && (
          <button className="btn btn-sm bg-[#1a7c3e] hover:bg-[#22a052] text-white border-none gap-2" onClick={() => setShowForm(true)}>
            <FiPlus /> Nouveau concours
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concoursList.map(c => (
          <ConcoursCard
            key={c.id}
            concours={c}
            onEdit={setEditConcours}
            onDelete={setDeleteConcours}
            onViewInscriptions={handleViewInscriptions}
          />
        ))}
        {concoursList.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-10">Aucun concours pour le moment.</p>
        )}
      </div>

      {/* Formulaire de création */}
      {showForm && <ConcoursForm onClose={() => setShowForm(false)} onSaved={handleSaved} />}
      
      {/* Formulaire d'édition */}
      {editConcours && (
        <ConcoursForm
          concours={editConcours}
          onClose={() => setEditConcours(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Confirmation suppression */}
      {deleteConcours && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="font-bold text-lg">Supprimer "{deleteConcours.nom}" ?</h3>
            <p className="py-4">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-ghost" onClick={() => setDeleteConcours(null)}>Annuler</button>
              <button className="btn btn-error" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcoursPage;
