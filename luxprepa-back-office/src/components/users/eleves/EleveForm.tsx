// components/eleves/EleveCreateForm.tsx
import { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { userApi, concoursApi, type Concours } from '../../../services/api';
import { MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
interface EleveCreateFormProps {
  onClose: () => void;
  onCreated: () => void;
}

const EleveCreateForm: React.FC<EleveCreateFormProps> = ({ onClose, onCreated }) => {
  const { user } = useAuth();
  const isProf = user?.role === 'prof';

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('')
  const [niveau, setNiveau] = useState('tle');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false)

  // Si le rôle est prof, on affiche un message d'interdiction
  if (isProf) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 text-center">
          <FiX className="mx-auto text-red-500" size={40} />
          <h3 className="text-lg font-bold mt-4">Accès refusé</h3>
          <p className="text-sm text-gray-500 mt-2">Les professeurs ne peuvent pas créer d'élèves.</p>
          <button className="btn btn-ghost mt-4" onClick={onClose}>Fermer</button>
        </div>
      </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !prenom || !telephone) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSubmitting(true);
    try {
      await userApi.create({
        nom, prenom, telephone,
        role: "eleve",
        niveau, password,specialite: undefined,
      });

      toast.success('Élève inscrit avec succès !');
      onCreated();
      onClose();
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FiX size={22} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-green-600">Ajouter un élève</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom et prénom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"><span className="label-text text-green-400 font-semibold">Nom *</span></label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label"><span className="label-text text-green-400 font-semibold">Prénom *</span></label>
              <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required className="input input-bordered w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Téléphone */}
            <div>
              <label className="label"><span className="label-text text-green-400 font-semibold">Téléphone *</span></label>
              <input type="text" value={telephone} onChange={(e) => setTelephone(e.target.value.replace(/\D/g, '').slice(0, 9))} required className="input input-bordered w-full" placeholder="6XXXXXXXX" />
            </div>
            <div className="form-control gap-1.5">
              <label className="label"><span className="label-text text-green-400 font-semibold">Mot de passe *</span></label>
              <div className="flex items-center gap-2 input input-bordered w-full rounded-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-green-400">
                <MdLock size={18} className="text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="grow text-sm bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>
          </div>


          {/* Niveau */}
          <div>
            <label className="label"><span className="label-text text-green-400 font-semibold">Niveau</span></label>
            <select value={niveau} onChange={(e) => setNiveau(e.target.value)} className="select select-bordered w-full">
              <option value="">Sélectionner</option>
              <option value="tle">Terminal</option>
              <option value="post_bac">Bacc +</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn btn-ghost text-gray-500" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <ClipLoader size={18} color="#fff" /> : <><FiSave /> Inscrire</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EleveCreateForm;
