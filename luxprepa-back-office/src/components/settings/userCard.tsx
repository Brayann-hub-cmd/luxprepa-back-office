// components/parametres/UserCard.tsx
import React from 'react';
import { FiUser, FiEdit2, FiTrash2, FiPhone } from 'react-icons/fi';
import { User } from '../../services/api';

interface UserCardProps {
  user: User;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
}

const roleBadgeClass: Record<string, string> = {
  eleve: 'badge-info',
  prof: 'badge-success',
  admin: 'badge-warning',
};

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-gray-100">
      <div className="card-body p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-neutral-content rounded-full w-12">
                <span className="text-xl font-bold">
                  {user.prenom.charAt(0).toUpperCase()}{user.nom.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">{user.prenom} {user.nom}</h3>
              <span className={`badge badge-sm ${roleBadgeClass[user.role]}`}>{user.role}</span>
              {user.specialite && (
                <span className="text-sm text-gray-500 ml-2">- {user.specialite}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-ghost" onClick={() => onEdit(user)} title="Modifier">
              <FiEdit2 />
            </button>
            <button
              className="btn btn-sm btn-ghost text-red-500"
              onClick={() => onDelete(user)}
              title="Supprimer"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-500 flex items-center gap-1">
          <FiPhone /> {user.telephone}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
