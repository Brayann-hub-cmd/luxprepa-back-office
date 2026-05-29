// components/parametres/UserForm.tsx
import React, { useState } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { userApi , type Users } from '../../services/api';

interface UserFormProps {
  user?: Users;
  onClose: () => void;
  onSaved: (u: Users) => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSaved }) => {
  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [telephone, setTelephone] = useState(user?.telephone || '');
  const [role, setRole] = useState<string>(user?.role || 'eleve');
  const [specialite, setSpecialite] = useState(user?.specialite || '');
  const [password, setPassword] = useState('');
  const niveau = 'tle'
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!user;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        const res = await userApi.update(user.id, {
          nom,
          prenom,
          telephone,
          role,
          specialite: role === 'prof' ? specialite : undefined,
          password: password || undefined,
        });
        toast.success('Utilisateur modifié');
        onSaved(res.user);
      } else {
        const res = await userApi.create({
          nom,
          prenom,
          telephone,
          role,
          specialite: role === 'prof' ? specialite : undefined,
          niveau: role === 'eleve' ? niveau: 'post_bac',
          password,
        });
        toast.success('Utilisateur créé');
        onSaved(res.user);
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
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Modifier' : 'Nouvel'} utilisateur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"><span className="label-text">Prénom *</span></label>
              <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label"><span className="label-text">Nom *</span></label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className="input input-bordered w-full" />
            </div>
          </div>
          <div>
            <label className="label"><span className="label-text">Téléphone *</span></label>
            <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} required className="input input-bordered w-full" />
          </div>
          <div>
            <label className="label"><span className="label-text">Rôle *</span></label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="select select-bordered w-full">
              <option value="">Professeur ou admin ?</option>
              <option value="prof">Professeur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          {role === 'prof' && (
            <div>
              <label className="label"><span className="label-text">Spécialité</span></label>
              <input type="text" value={specialite} onChange={(e) => setSpecialite(e.target.value)} className="input input-bordered w-full" placeholder="Ex: Mathématiques" />
            </div>
          )}
          <div>
            <label className="label">
              <span className="label-text">{isEditing ? 'Nouveau mot de passe (laisser vide pour conserver)' : 'Mot de passe *'}</span>
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!isEditing} className="input input-bordered w-full" />
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

export default UserForm;
