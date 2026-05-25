// pages/Parametres.tsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiUsers, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { userApi, User } from '../services/api';
import UserCard from '../components/parametres/UserCard';
import UserForm from '../components/parametres/UserForm';

const roleOrder = ['admin', 'prof', 'eleve'];

const Parametres: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await userApi.liste();
      setUsers(data);
    } catch {
      toast.error('Erreur de chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSaved = (u: User) => {
    setUsers(prev => {
      const exists = prev.find(x => x.id === u.id);
      if (exists) return prev.map(x => x.id === u.id ? u : x);
      return [...prev, u];
    });
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await userApi.delete(deleteUser.id);
      setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
      toast.success('Utilisateur supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteUser(null);
    }
  };

  // Filtrage et tri
  const filtered = users
    .filter(u => filterRole === 'all' || u.role === filterRole)
    .filter(u => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        u.nom.toLowerCase().includes(term) ||
        u.prenom.toLowerCase().includes(term) ||
        u.telephone.includes(term)
      );
    })
    .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role));

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><FiUsers /> Paramètres</h1>
        <button className="btn btn-primary gap-2" onClick={() => setShowForm(true)}>
          <FiPlus /> Nouvel utilisateur
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="join">
          <button
            className={`join-item btn btn-sm ${filterRole === 'all' ? 'btn-active' : ''}`}
            onClick={() => setFilterRole('all')}
          >
            Tous
          </button>
          {roleOrder.map(role => (
            <button
              key={role}
              className={`join-item btn btn-sm capitalize ${filterRole === role ? 'btn-active' : ''}`}
              onClick={() => setFilterRole(role)}
            >
              {role === 'eleve' ? 'Élèves' : role === 'prof' ? 'Professeurs' : 'Administrateurs'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered input-sm w-full pl-10"
          />
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(u => (
          <UserCard
            key={u.id}
            user={u}
            onEdit={(u) => setEditUser(u)}
            onDelete={(u) => setDeleteUser(u)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-10">Aucun utilisateur trouvé</p>
        )}
      </div>

      {/* Formulaire création */}
      {showForm && <UserForm onClose={() => setShowForm(false)} onSaved={handleSaved} />}

      {/* Formulaire édition */}
      {editUser && (
        <UserForm
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Confirmation suppression */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="font-bold text-lg">Supprimer "{deleteUser.prenom} {deleteUser.nom}" ?</h3>
            <p className="py-4">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-ghost" onClick={() => setDeleteUser(null)}>Annuler</button>
              <button className="btn btn-error" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parametres;
