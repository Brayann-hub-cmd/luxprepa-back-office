import { MdClose } from 'react-icons/md';
import type { Inscription } from '../../services/api';

const getInitiales = (prenom?: string, nom?: string) =>
  `${(prenom?.[0] || '').toUpperCase()}${(nom?.[0] || '').toUpperCase()}` || '?';

const couleurs = [
  'bg-primary', 'bg-secondary', 'bg-accent', 'bg-info',
  'bg-success', 'bg-warning', 'bg-error', 'bg-rose-500',
];

const getCouleur = (id: string) =>
  couleurs[parseInt(id.slice(0, 8), 16) % couleurs.length];

const statutBadge: Record<string, string> = {
  validee: 'badge-success',
  en_attente: 'badge-warning',
  rejetee: 'badge-error',
  annulee: 'badge-ghost',
};

const statutLabel: Record<string, string> = {
  validee: 'Validée',
  en_attente: 'En attente',
  rejetee: 'Rejetée',
  annulee: 'Annulée',
};

interface Props {
  inscription: Inscription;
  onClose: () => void;
}

const InscriptionDetailModal = ({ inscription, onClose }: Props) => {

  return (
    <dialog className="modal modal-open" onClick={onClose}>
      <div
        className="modal-box max-w-lg p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec avatar */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold ${getCouleur(inscription.id)}`}
              >
                {getInitiales(inscription.eleve_prenom, inscription.eleve_nom)}
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-base-content"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  {inscription.eleve_prenom} {inscription.eleve_nom}
                </h3>
                <p className="text-[13px] text-base-content/50">Inscription #{inscription.id.slice(0, 8)}</p>
              </div>
            </div>
            <button className="btn btn-sm btn-ghost btn-circle" onClick={onClose}>
              <MdClose size={18} />
            </button>
          </div>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-6">
          {/* Grille d'informations */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-base-content/40 font-semibold">Concours</p>
              <p className="text-[14px] font-medium">{inscription.concours?.nom || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-base-content/40 font-semibold">Statut</p>
              <span className={`badge badge-sm ${statutBadge[inscription.status] || 'badge-ghost'}`}>
                {statutLabel[inscription.status] || status}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-base-content/40 font-semibold">Date d'inscription</p>
              <p className="text-[14px]">{new Date(inscription.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-base-content/40 font-semibold">Dernière mise à jour</p>
              <p className="text-[14px]">{new Date(inscription.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-base-content/40 font-semibold">Montant dû</p>
              <p className="text-[14px] font-semibold">{(inscription.concours.montant_prepa + inscription.concours.inscription_prepa)?.toLocaleString() || 0} FCFA</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-base-content/40 font-semibold">Total payé</p>
              <p className={`text-[14px] font-semibold ${inscription.total_paye >= (inscription.concours.montant_prepa + inscription.concours.inscription_prepa) ? 'text-success' : ''}`}>
                {inscription.total_paye?.toLocaleString() || 0} FCFA
              </p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-[11px] uppercase tracking-wider text-base-content/40 font-semibold">Reste à payer</p>
              <p className={`text-[16px] font-bold ${inscription.reste_a_payer > 0 ? 'text-error' : 'text-success'}`}>
                {inscription.reste_a_payer > 0 ? `${inscription.reste_a_payer.toLocaleString()} FCFA` : 'Solde nul'}
              </p>
            </div>
          </div>

          {/* Infos élève supplémentaires */}
          {inscription.eleve_id && (
            <div className="border-t border-base-200 pt-4">
              <h4 className="text-[12px] font-semibold text-base-content/50 uppercase tracking-wider mb-3">Informations élève</h4>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div><span className="text-base-content/40">Téléphone :</span> {inscription.eleve_telephone || '—'}</div>
                <div><span className="text-base-content/40">Niveau :</span> {inscription.eleve_niveau || '—'}</div>
              </div>
            </div>
          )}

          {/* Barre de progression paiement */}
          {(inscription.concours.montant_prepa + inscription.concours.inscription_prepa) > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-base-content/50">Progression</span>
                <span className="font-semibold">{Math.round((inscription.total_paye / (inscription.concours.montant_prepa + inscription.concours.inscription_prepa)) * 100)}%</span>
              </div>
              <progress
                className="progress progress-success w-full"
                value={inscription.total_paye}
                max={inscription.concours.montant_prepa + inscription.concours.inscription_prepa}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-base-200 flex justify-end">
          <button className="btn btn-sm" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </dialog>
  );
};

export default InscriptionDetailModal;
