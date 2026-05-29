// components/concours/ConcoursCard.tsx
import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiCalendar, FiUsers, FiBookOpen } from 'react-icons/fi';
import { BiMoney } from 'react-icons/bi';
import { type Concours } from '../../services/api';
import { type User, tokenUtils } from '../../services/api';
import InscriptionsConcoursModal from '../inscriptions/voirInscription';
interface Props {
  concours: Concours;
  onEdit: (c: Concours) => void;
  onDelete: (c: Concours) => void;
  onViewInscriptions: (c: Concours) => void;
}

const ConcoursCard: React.FC<Props> = ({ concours, onEdit, onDelete, onViewInscriptions }) => {
  const user = tokenUtils.getUser() as User
  const isAdmin = user.role === 'admin';
  const [showInscriptions, setShowInscriptions] = useState(false);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR');

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-gray-100">
      <div className="card-body p-5">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-lg font-bold">{concours.nom}</h3>
          {isAdmin && (
            <div className="flex gap-2">
              <button className="btn btn-sm btn-ghost" onClick={() => onEdit(concours)}>
                <FiEdit2 />
              </button>
              <button className="btn btn-sm btn-ghost text-red-500" onClick={() => onDelete(concours)}>
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>

        {concours.description && (
          <p className="text-sm text-gray-500 mt-2">{concours.description}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <span className="flex items-center gap-1">
            <FiCalendar className="text-gray-400" />
            {formatDate(concours.date_debut)} → {formatDate(concours.date_fin)}
          </span>
          <span className="flex items-center gap-1">
            <FiUsers className="text-gray-400" />
            {concours.nombre_inscrits || 0} inscrits
          </span>
          <span className="flex items-center gap-1">
            <FiBookOpen className="text-gray-400" />
            {concours.nombre_matieres || 0} matières
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
          <span className="flex items-center gap-1">
            <BiMoney className="text-gray-400" />
            Inscription : <strong>{concours.inscription_prepa.toLocaleString()} FCFA</strong>
          </span>
          <span className="flex items-center gap-1">
            <BiMoney className="text-gray-400" />
            Prépa : <strong>{concours.montant_prepa.toLocaleString()} FCFA</strong>
          </span>
        </div>

        <div className="card-actions justify-end mt-4 pt-3 border-t border-gray-100">
          <button
            className="btn btn-sm btn-outline gap-2"
            onClick={() => setShowInscriptions(true)}
          >
            Voir les inscriptions
          </button>
        </div>
        {showInscriptions && (
          <InscriptionsConcoursModal
            concours={concours}
            onClose={() => setShowInscriptions(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ConcoursCard;