// components/eleves/EleveDetailModal.tsx
import { FiX, FiUser, FiShield } from 'react-icons/fi';
import { type Inscription, tokenUtils, type User } from '../../../services/api';

interface EleveDetailModalProps {
    inscription: Inscription | null;
    onClose: () => void;
}

const EleveDetailModal: React.FC<EleveDetailModalProps> = ({ inscription, onClose }) => {
    const user = tokenUtils.getUser() as User
    const isProf = user.role === 'prof';

    if (!inscription) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <FiX size={22} />
                </button>

                <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-green-500">
                    <FiUser /> Détails de l'élève
                </h2>
                <p className="text-sm text-gray-500 mb-6">{inscription.eleve_nom}</p>

                <div className="space-y-4">
                    {/* Nom complet */}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-gray-500">Nom complet</span>
                        <span className="text-sm font-semibold text-blue-200">{inscription.eleve_nom}</span>
                    </div>

                    {/* Téléphone */}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-gray-500">Téléphone</span>
                        {isProf ? (
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                                <FiShield /> Masqué
                            </span>
                        ) : (
                            // Si le téléphone n'est pas dans Inscription, on peut afficher un placeholder
                            <span className="text-sm font-semibold text-blue-200">
                                {inscription.eleve_telephone || 'Non renseigné'}
                            </span>
                        )}
                    </div>

                    {/* Niveau (à adapter si disponible) */}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-gray-500">Niveau</span>
                        <span className="text-sm text-blue-200">{inscription.eleve_niveau || 'Non renseigné'}</span>
                    </div>

                    {/* Concours visé */}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-gray-500">Concours visé</span>
                        <span className="text-sm font-semibold text-blue-300">{inscription.concours.nom}</span>
                    </div>

                    {/* Paiement */}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-gray-500">Total payé</span>
                        <span className="text-sm font-medium text-green-600">
                            {inscription.total_paye.toLocaleString()} FCFA
                        </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-gray-500">Reste à payer</span>
                        <span className="text-sm font-medium text-orange-600">
                            {inscription.reste_a_payer.toLocaleString()} FCFA
                        </span>
                    </div>

                    {/* Statut */}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-gray-500">Statut</span>
                        <span className={`badge badge-sm ${inscription.status === 'validee' ? 'badge-success' :
                            inscription.status === 'en_attente' ? 'badge-warning' :
                                inscription.status === 'rejetee' ? 'badge-error' : 'badge-ghost'
                            }`}>
                            {inscription.status}
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button className="btn btn-ghost text-gray-500" onClick={onClose}>Fermer</button>
                </div>
            </div>
        </div>
    );
};

export default EleveDetailModal;
