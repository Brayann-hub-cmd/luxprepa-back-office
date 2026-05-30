import { useEffect, useState } from "react"
import { MdSearch, MdCheckCircle, MdVisibility, MdAdd } from "react-icons/md"
import { ClipLoader } from "react-spinners"
import toast from "react-hot-toast"
import { inscriptionApi, type Inscription, tokenUtils, type User } from "../../services/api"
import InscriptionDetailModal from "../../components/inscriptions/inscriptionIdModal"
import AdminInscriptionForm from "../../components/users/eleves/AdminInscriptionForm"
type FilterTab = "toutes" | "en_attente" | "validee" | "rejetee"

const statutBadge: Record<string, string> = {
  validee: "badge-success",
  en_attente: "badge-warning",
  rejetee: "badge-error",
  annulee: "badge-ghost",
}

const statutLabel: Record<string, string> = {
  validee: "Confirmée",
  en_attente: "En attente",
  rejetee: "Rejetée",
  annulee: "Annulée",
}

const colors = ["bg-success", "bg-info", "bg-warning", "bg-secondary", "bg-error"]

const getInitiales = (nom: string) => {
  const parts = nom.split(" ")
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : nom.slice(0, 2).toUpperCase()
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })

const formatMontant = (montant: number) =>
  new Intl.NumberFormat("fr-CM").format(montant) + " FCFA"

const InscriptionsPage = () => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [loading, setLoading] = useState(true)
  const [validatingId, setValidatingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterTab>("toutes")
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const user = tokenUtils.getUser() as User
  const isAdmin = user.role === 'admin';

  const charger = async () => {
    setLoading(true)
    try {
      const data = await inscriptionApi.liste()
      setInscriptions(data)
    } catch {
      toast.error("Impossible de charger les inscriptions.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { charger() }, [])

  const handleValider = async (id: string) => {
    setValidatingId(id)
    try {
      await inscriptionApi.valider(id)
      toast.success("Inscription confirmée avec succès !")
      charger()
    } catch {
      toast.error("Erreur lors de la validation.")
    } finally {
      setValidatingId(null)
    }
  }

  const filtered = inscriptions.filter(ins => {
    const matchSearch = (ins.concours?.nom || "").toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "toutes" ? true : ins.status === filter
    return matchSearch && matchFilter
  })

  const nbAttente = inscriptions.filter(i => i.status === "en_attente").length

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-[22px] font-bold text-base-content"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Inscriptions
          </h2>
          <p className="text-[13px] text-base-content/50 mt-0.5">
            {nbAttente} inscription{nbAttente > 1 ? "s" : ""} en attente de traitement
          </p>
        </div>
        {
          isAdmin &&
          <button className="btn btn-sm bg-[#1a7c3e] hover:bg-[#22a052] text-white border-none gap-2" onClick={() => setModalOpen(true)}>
            <MdAdd size={16} />
            Nouvelle inscription
          </button>
        }
      </div>

      {/* Card */}
      <div className="card bg-base-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3.5 border-b border-base-200">
          <label className="input input-bordered input-sm flex items-center gap-2 min-w-[220px]">
            <MdSearch size={16} className="text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="grow text-[13px] bg-transparent"
            />
          </label>

          <div className="flex gap-1.5 flex-wrap">
            {([
              { key: "toutes", label: "Toutes" },
              { key: "en_attente", label: "En attente" },
              { key: "validee", label: "Confirmées" },
              { key: "rejetee", label: "Rejetées" },
            ] as { key: FilterTab; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`btn btn-xs rounded-full ${filter === tab.key ? "btn-neutral" : "btn-ghost"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <ClipLoader size={32} color="#1a7c3e" />
            </div>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr className="bg-base-200/50">
                  <th className="text-[12px] font-semibold text-base-content/50">Élève</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Concours</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Date</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Total payé</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Reste</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Statut</th>
                  <th className="text-[12px] font-semibold text-base-content/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ins, i) => {
                  const nom = ins.concours?.nom || "—"
                  const color = colors[i % colors.length]
                  return (
                    <tr key={ins.id} className="hover:bg-base-200/30 transition-colors">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 ${color}`}>
                            {getInitiales(nom)}
                          </div>
                          <span className="font-semibold text-[13px] text-base-content">{nom}</span>
                        </div>
                      </td>
                      <td className="text-[13px] text-base-content/70">{ins.concours?.nom || "—"}</td>
                      <td className="text-[13px] text-base-content/70">{formatDate(ins.created_at)}</td>
                      <td className="text-[13px] text-base-content/70">{formatMontant(ins.total_paye)}</td>
                      <td className="text-[13px] text-base-content/70">{formatMontant(ins.reste_a_payer)}</td>
                      <td>
                        <span className={`badge badge-sm ${statutBadge[ins.status] || "badge-ghost"}`}>
                          {statutLabel[ins.status] || ins.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1.5">
                          {(ins.status === "en_attente" && isAdmin) && (
                            <button
                              className="btn btn-xs bg-success/10 text-success hover:bg-success hover:text-white border-none gap-1"
                              onClick={() => handleValider(ins.id)}
                              disabled={validatingId === ins.id}
                            >
                              {validatingId === ins.id
                                ? <ClipLoader size={10} color="currentColor" />
                                : <MdCheckCircle size={13} />
                              }
                              Confirmer
                            </button>
                          )}
                          {isAdmin ? <button
                            className="btn btn-xs btn-ghost gap-1"
                            onClick={() => setSelectedInscription(ins)}
                          >
                            <MdVisibility size={13} />
                            Voir
                          </button> : <span>Aucune</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 text-base-content/40 text-[14px]">
              Aucune inscription trouvée.
            </div>
          )}
          {selectedInscription && (
            <InscriptionDetailModal
              inscription={selectedInscription}
              onClose={() => setSelectedInscription(null)}
            />
          )}
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Inscription administrateur</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                ✕
              </button>
            </div>
            <AdminInscriptionForm onSuccess={() => { setModalOpen(false); toast.success('Inscription réussie !'); }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default InscriptionsPage
