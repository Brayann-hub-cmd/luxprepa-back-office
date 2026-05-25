// components/AnnonceCard.tsx
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaUser, FaClock, FaTag } from 'react-icons/fa';
import { type Annonce } from '../../services/api';

interface AnnonceCardProps {
    annonce: Annonce;
    onDetail: (annonce: Annonce) => void;
    onEdit: (annonce: Annonce) => void;
    onDelete: (annonce: Annonce) => void;
}

// Fonction pour afficher la date relative (optionnel, utilise react-hot-toast pour autre chose)
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
const API_BASE_URL = import.meta.env.VITE_API_URL
export const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    // URL absolue (déjà complète)
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // Chemin relatif -> on préfixe
    return `http://127.0.0.1:8000/api${path.startsWith('/') ? '' : '/'}${path}`;
};

const AnnonceCard: React.FC<AnnonceCardProps> = ({ annonce, onDetail, onEdit, onDelete }) => {
    const imageUrl = annonce.image ? getImageUrl(annonce.image) : null;
    return (
        <div className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-150 border border-gray-100">
            {/* Image avec Swiper si plusieurs photos, sinon image unique */}
            {imageUrl ? (
                <Swiper
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation={false}
                    pagination={{ clickable: true }}
                    className="w-full h-48 bg-gray-200 rounded-t-2xl"
                >
                    <SwiperSlide>
                        <img
                            src={imageUrl}
                            alt={annonce.titre}
                            className="w-full h-48 object-cover"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                        />
                    </SwiperSlide>
                </Swiper>
            ) : (
                <div className="w-full h-48 bg-gray-200 rounded-t-2xl flex items-center justify-center text-gray-400">
                    <FaTag size={48} />
                </div>
            )}


            <div className="card-body p-4">
                {/* Titre */}
                <h2 className="card-title text-lg font-bold text-green-500 line-clamp-2">
                    {annonce.titre}
                </h2>

                {/* Contenu tronqué */}
                <p className="text-sm text-gray-600 line-clamp-3 mt-1">
                    {annonce.contenu}
                </p>

                {/* Badge type et visibilité */}
                <div className="mt-3 flex flex-wrap gap-2">
                    <span
                        className={`badge badge-sm ${annonce.type === 'alerte'
                            ? 'badge-error'
                            : annonce.type === 'resultat'
                                ? 'badge-success'
                                : annonce.type === 'info'
                                    ? 'badge-primary'
                                    : 'badge-ghost'
                            }`}
                    >
                        {annonce.type}
                    </span>
                    {annonce.is_public ? (
                        <span className="badge badge-outline badge-success text-xs">Public</span>
                    ) : (
                        <span className="badge badge-outline badge-warning text-xs">Privé</span>
                    )}
                </div>

                {/* Admin et date */}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <FaUser />
                        <span>{annonce.admin_nom}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaClock />
                        <span>{timeAgo(annonce.created_at)}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-row items-center card-actions justify-center p-4 pt-0">
                <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => onDetail(annonce)}
                >
                    <FiEye /> Détails
                </button>
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onEdit(annonce)}
                >
                    <FiEdit2 /> Modifier
                </button>
                <button className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50" onClick={() => onDelete(annonce)} title="Supprimer">
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
};

export default AnnonceCard;
