// components/concours/ConcoursForm.tsx
import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { concoursApi, matiereApi,type Concours, type Matiere } from '../../services/api';

interface Props {
  concours?: Concours;
  onClose: () => void;
  onSaved: (c: Concours) => void;
}
interface MatiereWithCoeff {
  matiere_id: string;
  coefficient: number;
}
const getSelectedMatieresFromConcours = (concours: Concours): Record<string, MatiereWithCoeff> => {
  const result: Record<string, MatiereWithCoeff> = {};
  if (concours.matieres) {
    concours.matieres.forEach(m => {
      result[m.id] = { matiere_id: m.id, coefficient: m.coefficient };
    });
  }
  return result;
};
const ConcoursForm: React.FC<Props> = ({ concours, onClose, onSaved }) => {
  const isEditing = !!concours;
  const [nom, setNom] = useState(concours?.nom || '');
  const [description, setDescription] = useState(concours?.description || '');
  const [inscriptionPrepa, setInscriptionPrepa] = useState(concours?.inscription_prepa || 0);
  const [montantPrepa, setMontantPrepa] = useState(concours?.montant_prepa || 0);
  const [dateDebut, setDateDebut] = useState(concours ? concours.date_debut.slice(0, 10) : '');
  const [dateFin, setDateFin] = useState(concours ? concours.date_fin.slice(0, 10) : '');
  const [matieresDisponibles, setMatieresDisponibles] = useState<Matiere[]>([]);
  const [selectedMatieres, setSelectedMatieres] = useState<Record<string, MatiereWithCoeff>>(
    isEditing ? getSelectedMatieresFromConcours(concours) : {}
  );
  const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
    matiereApi.liste()
      .then(setMatieresDisponibles)
      .catch(() => toast.error('Erreur chargement matières'));
  }, []);

  const toggleMatiere = (matiereId: string) => {
    setSelectedMatieres(prev => {
      if (prev[matiereId]) {
        const { [matiereId]: _, ...rest } = prev;
        return rest;
      } else {
        // Coefficient par défaut = 1
        return { ...prev, [matiereId]: { matiere_id: matiereId, coefficient: 1 } };
      }
    });
  };

  const handleCoefficientChange = (matiereId: string, value: number) => {
    setSelectedMatieres(prev => {
      if (!prev[matiereId]) return prev;
      return {
        ...prev,
        [matiereId]: { ...prev[matiereId], coefficient: value },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !dateDebut || !dateFin) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    if (new Date(dateFin) < new Date(dateDebut)) {
      toast.error('La date de fin doit être après la date de début');
      return;
    }
    const matieresPayload = Object.values(selectedMatieres);
    if (matieresPayload.length === 0) {
      toast.error('Sélectionnez au moins une matière');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        nom,
        description,
        inscription_prepa: inscriptionPrepa,
        montant_prepa: montantPrepa,
        date_debut: dateDebut,
        date_fin: dateFin,
        matieres: matieresPayload,
      };
      let res: Concours;
      if (isEditing) {
        res = (await concoursApi.modifier(concours.id, data)).concours;
        toast.success('Concours modifié');
      } else {
        res = (await concoursApi.creer(data)).concours;
        toast.success('Concours créé');
      }
      onSaved(res);
      onClose();
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 my-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400"><FiX size={24} /></button>
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Modifier' : 'Nouveau'} concours</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <div>
            <label className="label"><span className="label-text">Nom *</span></label>
            <input type="text" value={nom} onChange={e => setNom(e.target.value)} required className="input input-bordered w-full" />
          </div>

          {/* Description */}
          <div>
            <label className="label"><span className="label-text">Description</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="textarea textarea-bordered w-full" rows={3} />
          </div>

          {/* Montants */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"><span className="label-text">Frais inscription (FCFA) *</span></label>
              <input type="number" value={inscriptionPrepa} onChange={e => setInscriptionPrepa(Number(e.target.value))} min={0} required className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label"><span className="label-text">Frais préparation (FCFA) *</span></label>
              <input type="number" value={montantPrepa} onChange={e => setMontantPrepa(Number(e.target.value))} min={0} required className="input input-bordered w-full" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"><span className="label-text">Date début *</span></label>
              <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} required className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label"><span className="label-text">Date fin *</span></label>
              <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} required className="input input-bordered w-full" />
            </div>
          </div>

          {/* Matières avec coefficients */}
           <div>
            <label className="label"><span className="label-text">Matières *</span></label>
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
              {matieresDisponibles.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded">
                  <input
                    type="checkbox"
                    checked={!!selectedMatieres[m.id]}
                    onChange={() => toggleMatiere(m.id)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="text-sm flex-1">{m.nom}</span>
                  {selectedMatieres[m.id] && (
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-gray-500">Coef:</label>
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={selectedMatieres[m.id].coefficient}
                        onChange={e => handleCoefficientChange(m.id, parseInt(e.target.value) || 1)}
                        className="input input-xs input-bordered w-16 text-center"
                      />
                    </div>
                  )}
                </div>
              ))}
              {matieresDisponibles.length === 0 && (
                <p className="text-sm text-gray-400">Aucune matière disponible</p>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{Object.keys(selectedMatieres).length} matière(s) sélectionnée(s)</p>
          </div>

          {/* Boutons */}
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

export default ConcoursForm;