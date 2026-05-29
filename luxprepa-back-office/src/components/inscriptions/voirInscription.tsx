import { useEffect, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { inscriptionApi, type Inscription, type Concours } from '../../services/api';

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

const getInitiales = (nom: string) =>
  nom?.split(' ').slice(0, 2).map(m => m[0]).join('').toUpperCase() || '?';

const couleurs = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-info', 'bg-success', 'bg-warning', 'bg-error'];
const getCouleur = (id: string) => couleurs[parseInt(id.slice(0, 8), 16) % couleurs.length];

interface Props {
  concours: Concours;
  onClose: () => void;
}

const InscriptionsConcoursModal = ({ concours, onClose }: Props) => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInscriptions = async () => {
      try {
        const data = await inscriptionApi.getByConcours(concours.id);
        setInscriptions(data);
      } catch {
        // gestion silencieuse
      } finally {
        setLoading(false);
      }
    };
    fetchInscriptions();
  }, [concours.id]);

  const filtered = inscriptions.filter(ins => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ins.eleve_nom?.toLowerCase().includes(q) ||
      ins.eleve_prenom?.toLowerCase().includes(q) ||
      ins.eleve_telephone?.toLowerCase().includes(q) ||
      ins.status?.toLowerCase().includes(q)
    );
  });

  return (
    <dialog className="modal modal-open" onClick={onClose}>
      <div className="modal-box max-w-4xl p-0" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <div>
            <h3 className="font-bold text-lg" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Inscriptions – {concours.nom}
            </h3>
            <p className="text-[13px] text-base-content/50 mt-0.5">
              {loading ? "Chargement..." : `${inscriptions.length} inscription${inscriptions.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            className="btn btn-sm btn-ghost btn-circle"
            onClick={onClose}
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-base-200">
          <label className="input input-bordered input-sm flex items-center gap-2 max-w-md">
            <MdSearch size={14} className="text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="grow text-[13px] bg-transparent"
            />
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-base-content/40 text-[14px]">
              {inscriptions.length === 0
                ? "Aucune inscription pour ce concours."
                : "Aucune inscription ne correspond à votre recherche."}
            </div>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr className="bg-base-200/50">
                  <th className="text-[12px] font-semibold text-base-content/50">Élève</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Téléphone</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Niveau</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Paiement</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ins => (
                  <tr key={ins.id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 ${getCouleur(ins.id)}`}>
                          {getInitiales(`${ins.eleve_prenom || ''} ${ins.eleve_nom || ''}`)}
                        </div>
                        <span className="font-semibold text-[13px] text-base-content">
                          {ins.eleve_prenom} {ins.eleve_nom}
                        </span>
                      </div>
                    </td>
                    <td className="text-[13px] text-base-content/70">{ins.eleve_telephone ?? '—'}</td>
                    <td className="text-[13px] text-base-content/70">{ins.eleve_niveau ?? '—'}</td>
                    <td className="text-[13px]">
                      {ins.total_paye > 0 ? (
                        <span className="text-success font-medium">{ins.total_paye.toLocaleString()} FCFA</span>
                      ) : (
                        <span className="text-error text-[12px]">Non payé</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-sm ${statutBadge[ins.status] || 'badge-ghost'}`}>
                        {statutLabel[ins.status] || ins.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default InscriptionsConcoursModal;
