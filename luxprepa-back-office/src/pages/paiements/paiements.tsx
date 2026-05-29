import React, { useEffect, useState } from 'react';
import { paiementApi, type Paiement, inscriptionApi, type Inscription } from '../../services/api';
import { toast } from 'react-hot-toast';
import { MdRefresh, MdSearch, MdAdd } from 'react-icons/md';
const statutBadge: Record<string, string> = {
  en_attente: 'badge-warning',
  en_cours:   'badge-info',
  paye:       'badge-success',
  echoue:     'badge-error',
};

const statutLabel: Record<string, string> = {
  en_attente: 'En attente',
  en_cours:   'En cours',
  paye:       'Payé',
  echoue:     'Échoué',
};

const getInitiales = (nom: string): string =>
  nom?.split(' ').slice(0, 2).map(m => m[0]).join('').toUpperCase() || '?';

const couleurs = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-info', 'bg-success', 'bg-warning', 'bg-error'];
const getCouleur = (id: string) => couleurs[parseInt(id.slice(0, 8), 16) % couleurs.length];

const PaiementsPage = () => {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState('');
  const [montant, setMontant] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pData, iData] = await Promise.all([
        paiementApi.liste(),
        inscriptionApi.liste(),
      ]);
      setPaiements(pData);
      setInscriptions(iData);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = paiements.filter(p => {
    const matchSearch = !search || 
      p.eleve_nom?.toLowerCase().includes(search.toLowerCase()) ||
      p.eleve_prenom?.toLowerCase().includes(search.toLowerCase()) ||
      p.concours_nom?.toLowerCase().includes(search.toLowerCase()) ||
      p.statut?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'tous' || p.statut === filter;
    return matchSearch && matchFilter;
  });

  const handleVerser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInscription || montant <= 0) {
      toast.error('Veuillez sélectionner une inscription et un montant valide');
      return;
    }
    try {
      await paiementApi.verser({ inscription_id: selectedInscription, montant });
      toast.success('Paiement enregistré');
      setShowModal(false);
      setSelectedInscription('');
      setMontant(0);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du versement');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-[22px] font-bold text-base-content"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Paiements
          </h2>
          <p className="text-[13px] text-base-content/50 mt-0.5">
            {loading ? "Chargement..." : `${paiements.length} paiement${paiements.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="btn btn-sm btn-ghost btn-circle"
            title="Rafraîchir"
            disabled={loading}
          >
            <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            className="btn btn-sm bg-[#1a7c3e] hover:bg-[#22a052] text-white border-none gap-2"
            onClick={() => setShowModal(true)}
          >
            <MdAdd size={16} />
            Nouveau paiement
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="card bg-base-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3.5 border-b border-base-200">
          <label className="input input-bordered input-sm flex items-center gap-2 min-w-[220px]">
            <MdSearch size={16} className="text-base-content/40" />
            <input
              type="text"
              placeholder="Élève, concours ou statut..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="grow text-[13px] bg-transparent"
            />
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {(["tous", "en_attente", "en_cours", "paye", "echoue"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`btn btn-xs rounded-full ${filter === tab ? "btn-neutral" : "btn-ghost"}`}
              >
                {tab === "tous" ? "Tous"
                  : tab === "en_attente" ? "En attente"
                    : tab === "en_cours" ? "En cours"
                      : tab === "paye" ? "Payés"
                        : "Échoués"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg text-[#1a7c3e]" />
            </div>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr className="bg-base-200/50">
                  <th className="text-[12px] font-semibold text-base-content/50">Élève</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Concours</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Montant</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Total payé</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Reste</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Statut</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 ${getCouleur(p.id)}`}>
                          {getInitiales(`${p.eleve_prenom} ${p.eleve_nom}`)}
                        </div>
                        <span className="font-semibold text-[13px] text-base-content">
                          {p.eleve_prenom} {p.eleve_nom}
                        </span>
                      </div>
                    </td>
                    <td className="text-[13px] text-base-content/70">{p.concours_nom}</td>
                    <td className="text-[13px]">{p.montant.toLocaleString()} FCFA</td>
                    <td className="text-[13px]">{p.total_paye.toLocaleString()} FCFA</td>
                    <td className={`text-[13px] ${p.reste_a_payer > 0 ? 'text-error font-medium' : ''}`}>
                      {p.reste_a_payer.toLocaleString()} FCFA
                    </td>
                    <td>
                      <span className={`badge badge-sm ${statutBadge[p.statut]}`}>
                        {statutLabel[p.statut]}
                      </span>
                    </td>
                    <td className="text-[13px] text-base-content/60">
                      {new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 text-base-content/40 text-[14px]">
              {paiements.length === 0 ? "Aucun paiement enregistré." : "Aucun paiement ne correspond à votre recherche."}
            </div>
          )}
        </div>
      </div>

      {/* Modal création paiement */}
      {showModal && (
        <dialog className="modal modal-open" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-6">Nouveau paiement</h3>
            <form onSubmit={handleVerser} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Inscription</span></label>
                <select
                  className="select select-bordered w-full"
                  value={selectedInscription}
                  onChange={e => setSelectedInscription(e.target.value)}
                  required
                >
                  <option value="" disabled>Choisissez un élève</option>
                  {inscriptions.map(ins => (
                    <option key={ins.id} value={ins.id}>
                      {ins.eleve_prenom} {ins.eleve_nom} – {ins.concours.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Montant (FCFA)</span></label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={montant}
                  onChange={e => setMontant(Number(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn bg-[#1a7c3e] hover:bg-[#22a052] text-white border-none">Verser</button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default PaiementsPage;
