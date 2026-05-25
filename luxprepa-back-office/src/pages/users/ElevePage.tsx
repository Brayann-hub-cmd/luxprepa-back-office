import { useState } from "react"
import { MdSearch, MdVisibility, MdPersonAdd } from "react-icons/md"
import { ClipLoader } from "react-spinners"

type FilterTab = "tous" | "actifs" | "inactifs"

const mockEleves = [
  { id: "1", initiales: "EK", color: "bg-success",   nom: "Emma Kouam",   telephone: "+237 694 00 11 22", niveau: "Terminale C", concours: "ENSPD",      paiement: "15 000 FCFA", statut: "actif" },
  { id: "2", initiales: "PM", color: "bg-info",      nom: "Paul Mbarga",  telephone: "+237 677 33 44 55", niveau: "Bac+1",       concours: "IUT Douala", paiement: "En attente",  statut: "attente" },
  { id: "3", initiales: "SN", color: "bg-warning",   nom: "Sophie Ngo",   telephone: "+237 655 22 33 44", niveau: "Terminale D", concours: "Médecine",   paiement: "20 000 FCFA", statut: "actif" },
  { id: "4", initiales: "JF", color: "bg-secondary", nom: "Jules Foka",   telephone: "+237 699 55 66 77", niveau: "Terminale A", concours: "ENSPT",      paiement: "Non payé",    statut: "inactif" },
  { id: "5", initiales: "AE", color: "bg-error",     nom: "Alima Essama", telephone: "+237 670 88 99 00", niveau: "Bac+1",       concours: "IAI",        paiement: "8 000 FCFA",  statut: "actif" },
]

const statutBadge: Record<string, string> = {
  actif:   "badge-success",
  attente: "badge-warning",
  inactif: "badge-error",
}

const statutLabel: Record<string, string> = {
  actif:   "Actif",
  attente: "En attente",
  inactif: "Inactif",
}

const ElevesPage = () => {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterTab>("tous")
  const [loading] = useState(false)

  const filtered = mockEleves.filter(e => {
    const matchSearch = e.nom.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === "tous"    ? true :
      filter === "actifs"  ? e.statut === "actif" :
      e.statut === "inactif"
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
            {mockEleves.length} élèves inscrits cette session
          </p>
        </div>
        <button className="btn btn-sm bg-[#1a7c3e] hover:bg-[#22a052] text-white border-none gap-2">
          <MdPersonAdd size={16} />
          Ajouter un élève
        </button>
      </div>

      {/* Card */}
      <div className="card bg-base-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3.5 border-b border-base-200">
          <label className="input input-bordered input-sm flex items-center gap-2 min-w-[220px]">
            <MdSearch size={16} className="text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="grow text-[13px] bg-transparent"
            />
          </label>

          <div className="flex gap-1.5">
            {(["tous", "actifs", "inactifs"] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`btn btn-xs rounded-full ${filter === tab ? "btn-neutral" : "btn-ghost"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                {filtered.map(eleve => (
                  <tr key={eleve.id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 ${eleve.color}`}>
                          {eleve.initiales}
                        </div>
                        <span className="font-semibold text-[13px] text-base-content">{eleve.nom}</span>
                      </div>
                    </td>
                    <td className="text-[13px] text-base-content/70">{eleve.telephone}</td>
                    <td className="text-[13px] text-base-content/70">{eleve.niveau}</td>
                    <td className="text-[13px] text-base-content/70">{eleve.concours}</td>
                    <td className="text-[13px] text-base-content/70">{eleve.paiement}</td>
                    <td>
                      <span className={`badge badge-sm ${statutBadge[eleve.statut]}`}>
                        {statutLabel[eleve.statut]}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-xs btn-ghost gap-1">
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
              Aucun élève trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ElevesPage