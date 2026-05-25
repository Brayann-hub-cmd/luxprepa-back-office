// components/annonce/AnnonceDetailModal.tsx
import React from 'react';
import { FiX, FiClock, FiUser, FiTag } from 'react-icons/fi';
import { type Annonce } from '../../services/api';
const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days} j`;
};

interface AnnonceDetailModalProps {
  annonce: Annonce;
  onClose: () => void;
}

const AnnonceDetailModal: React.FC<AnnonceDetailModalProps> = ({ annonce, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FiX size={24} />
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          {annonce.image ? (
            <img src={annonce.image} alt={annonce.titre} className="w-full md:w-1/2 h-64 object-cover rounded-xl" />
          ) : (
            <div className="w-full md:w-1/2 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
              <FiTag size={48} />
            </div>
          )}

          {/* Contenu */}
          <div className="flex-1">
            <h2 className="text-2xl text-green-400 font-bold mb-2">{annonce.titre}</h2>
            <span className={`badge badge-sm ${
              annonce.type === 'alerte' ? 'badge-error' : annonce.type === 'resultat' ? 'badge-success' : annonce.type === 'info' ? 'badge-primary' : 'badge-ghost'
            }`}>
              {annonce.type}
            </span>
            <span className={`badge badge-sm ml-2 ${annonce.is_public ? 'badge-success' : 'badge-warning'}`}>
              {annonce.is_public ? 'Public' : 'Privé'}
            </span>
            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{annonce.contenu}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1"><FiUser /><span>{annonce.admin_nom}</span></div>
              <div className="flex items-center gap-1"><FiClock /><span>{timeAgo(annonce.created_at)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnonceDetailModal;
