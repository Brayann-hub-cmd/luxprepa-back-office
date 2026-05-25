// pages/ListeMatieres.tsx
import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { matiereApi, type Matiere } from '../../services/api';
import MatiereCard from '../../components/matiere/matiereCard';
import MatiereForm from '../../components/matiere/matiereForm';

const ListeMatieres: React.FC = () => {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMatiere, setEditMatiere] = useState<Matiere | null>(null);
  const [deleteMatiere, setDeleteMatiere] = useState<Matiere | null>(null);

  const fetchMatieres = async () => {
    try {
      const data = await matiereApi.liste();
      setMatieres(data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatieres(); }, []);

  const handleSaved = (m: Matiere) => {
    setMatieres(prev => {
      const exists = prev.find(x => x.id === m.id);
      if (exists) return prev.map(x => x.id === m.id ? m : x);
      return [m, ...prev];
    });
  };

  const handleDelete = async () => {
    if (!deleteMatiere) return;
    try {
      await matiereApi.supprimer(deleteMatiere.id);
      setMatieres(prev => prev.filter(x => x.id !== deleteMatiere.id));
      toast.success('Matière supprimée');
    } catch {
      toast.error('Erreur');
    } finally {
      setDeleteMatiere(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📚 Matières</h1>
        <button className="btn btn-primary gap-2" onClick={() => setShowForm(true)}>
          <FiPlus /> Nouvelle matière
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matieres.map(m => (
          <MatiereCard
            key={m.id}
            matiere={m}
            onEdit={(m) => setEditMatiere(m)}
            onDelete={(m) => setDeleteMatiere(m)}
          />
        ))}
        {matieres.length === 0 && <p className="col-span-full text-center text-gray-500">Aucune matière</p>}
      </div>

      {/* Formulaire création */}
      {showForm && <MatiereForm onClose={() => setShowForm(false)} onSaved={handleSaved} />}

      {/* Formulaire édition */}
      {editMatiere && (
        <MatiereForm
          matiere={editMatiere}
          onClose={() => setEditMatiere(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Confirmation suppression */}
      {deleteMatiere && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="font-bold text-lg">Supprimer "{deleteMatiere.nom}" ?</h3>
            <p className="py-4">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-ghost" onClick={() => setDeleteMatiere(null)}>Annuler</button>
              <button className="btn btn-error" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeMatieres;
