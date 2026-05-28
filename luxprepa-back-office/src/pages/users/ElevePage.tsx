import { useState, useEffect } from "react"
import { MdSearch, MdVisibility, MdPersonAdd, MdRefresh } from "react-icons/md"
import { ClipLoader } from "react-spinners"
import { inscriptionApi, type Inscription, tokenUtils, type User } from "../../services/api"
import toast from "react-hot-toast"
import EleveCreateForm from "../../components/users/eleves/EleveForm"
import EleveDetailModal from "../../components/users/eleves/EleveDetails"

type FilterTab = "tous" | "validee" | "en_attente" | "rejetee"

const statutBadge: Record<string, string> = {
  validee: "badge-success",
  en_attente: "badge-warning",
  rejetee: "badge-error",
  annulee: "badge-ghost",
}

const statutLabel: Record<string, string> = {
  validee: "Validée",
  en_attente: "En attente",
  rejetee: "Rejetée",
  annulee: "Annulée",
}

// ── Helper initiales ──────────────────────────────────────────────────────────
function getInitiales(nom: string): string {
  return nom
    .split(" ")
    .map(m => m[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// ── Helper couleur avatar déterministe ────────────────────────────────────────

const COLORS = [
  "bg-success", "bg-info", "bg-warning",
  "bg-error", "bg-primary", "bg-secondary", "bg-accent",
]

function getColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

// ── Helper montant ────────────────────────────────────────────────────────────
function formatMontant(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} FCFA`
}

// ── Page ──────────────────────────────────────────────────────────────────────

const ElevesPage = () => {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterTab>("tous")
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const user = tokenUtils.getUser() as User
  const isAdmin = user.role === "admin"

  // ── Chargement ──
  const fetchInscriptions = async () => {
    try {
      setLoading(true)
      const data = await inscriptionApi.liste()
      setInscriptions(data)
    } catch {
      toast.error("Impossible de charger les inscriptions.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInscriptions() }, [])

  // ── Filtrage ──
  const filtered = inscriptions.filter(insc => {
    const q = search.toLowerCase()
    const matchSearch =
      insc.eleve_nom.toLowerCase().includes(q) ||
      insc.eleve_telephone?.includes(q) ||
      insc.concours.nom.toLowerCase().includes(q)

    const matchFilter =
      filter === "tous" ? true :
        filter === "validee" ? insc.status === "validee" :
          filter === "en_attente" ? insc.status === "en_attente" :
            insc.status === "rejetee" || insc.status === "annulee"

    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-[22px] font-bold text-base-content"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Élèves
          </h2>
          <p className="text-[13px] text-base-content/50 mt-0.5">
            {loading ? "Chargement..." : `${inscriptions.length} inscription${inscriptions.length !== 1 ? "s" : ""} cette session`}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchInscriptions}
            className="btn btn-sm btn-ghost btn-circle"
            title="Rafraîchir"
            disabled={loading}
          >
            <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
          </button>

          {isAdmin && (
            <button
              className="btn btn-sm bg-[#1a7c3e] hover:bg-[#22a052] text-white border-none gap-2"
              onClick={() => setShowCreateForm(true)}
            >
              <MdPersonAdd size={16} />
              Ajouter un élève
            </button>
          )}
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
              placeholder="Nom, téléphone ou concours..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="grow text-[13px] bg-transparent"
            />
          </label>

          <div className="flex gap-1.5 flex-wrap">
            {(["tous", "validee", "en_attente", "rejetee"] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`btn btn-xs rounded-full ${filter === tab ? "btn-neutral" : "btn-ghost"}`}
              >
                {tab === "tous" ? "Tous"
                  : tab === "validee" ? "Validés"
                    : tab === "en_attente" ? "En attente"
                      : "Rejetés/Annulés"}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <ClipLoader size={32} color="#1a7c3e" />
            </div>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr className="bg-base-200/50">
                  <th className="text-[12px] font-semibold text-base-content/50">Nom complet</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Téléphone</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Niveau</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Concours visé</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Paiement</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Statut</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(insc => (
                  <tr key={insc.id} className="hover:bg-base-200/30 transition-colors">

                    {/* Nom + avatar */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 ${getColor(insc.eleve_id)}`}>
                          {getInitiales(insc.eleve_nom)}
                        </div>
                        <span className="font-semibold text-[13px] text-base-content">
                          {insc.eleve_nom}
                        </span>
                      </div>
                    </td>

                    {/* Téléphone */}
                    {isAdmin ?
                      <td className="text-[13px] text-base-content/70">
                        {insc.eleve_telephone ?? (
                          <span className="text-base-content/30 italic text-[12px]">—</span>
                        )}
                      </td> :
                      <td className="text-[13px] text-base-content/70">
                        Masqué
                      </td>
                    }

                    {/* Niveau */}
                    <td>
                      {insc.eleve_niveau ? (
                        <span className="badge badge-sm badge-ghost text-[11px]">
                          {insc.eleve_niveau}
                        </span>
                      ) : (
                        <span className="text-base-content/30 text-[12px]">—</span>
                      )}
                    </td>

                    {/* Concours */}
                    <td className="text-[13px] text-base-content/70">
                      {insc.concours.nom}
                    </td>

                    {/* Paiement */}
                    <td className="text-[13px]">
                      {insc.total_paye > 0 && insc.reste_a_payer === 0 ? (
                        <span className="text-success font-medium">
                          {formatMontant(insc.total_paye)}
                        </span>
                      ) : insc.total_paye > 0 ? (
                        <div className="space-y-0.5">
                          <span className="text-warning font-medium">
                            {formatMontant(insc.total_paye)}
                          </span>
                          <p className="text-[11px] text-base-content/40">
                            reste {formatMontant(insc.reste_a_payer)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-error text-[12px]">Non payé</span>
                      )}
                    </td>

                    {/* Statut */}
                    <td>
                      <span className={`badge badge-sm ${statutBadge[insc.status]}`}>
                        {statutLabel[insc.status]}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <button
                        className="btn btn-xs btn-ghost gap-1"
                        onClick={() => setSelectedInscription(insc)}
                      >
                        <MdVisibility size={13} />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 text-base-content/40 text-[14px]">
              {inscriptions.length === 0
                ? "Aucune inscription enregistrée."
                : "Aucune inscription ne correspond à votre recherche."
              }
            </div>
          )}
        </div>
      </div>

      {/* Modal détail */}
      {selectedInscription && (
        <EleveDetailModal
          inscription={selectedInscription}
          onClose={() => setSelectedInscription(null)}
        />
      )}

      {/* Formulaire création */}
      {showCreateForm && (
        <EleveCreateForm
          onClose={() => setShowCreateForm(false)}
          onCreated={fetchInscriptions}
        />
      )}
    </div>
  )
}

export default ElevesPage