import {
  MdPayment, MdGrade, MdSchool, MdBook,
  MdCalendarMonth, MdCampaign, MdPerson,
  MdAdminPanelSettings, MdSettings
} from "react-icons/md"
import type { PageId } from "./AdminDashboard"

interface PlaceholderPageProps {
  page: PageId
}
 
const pageConfig: Record<string, {
  title: string
  sub: string
  icon: React.ReactNode
  btnLabel: string
  colorClass: string
}> = {
  paiements:  { title: "Paiements",       sub: "Suivi des paiements de frais de dossier",  icon: <MdPayment size={40} />,            btnLabel: "+ Enregistrer",   colorClass: "text-info bg-info/10" },
  notes:      { title: "Notes",           sub: "Résultats des élèves par matière",          icon: <MdGrade size={40} />,              btnLabel: "+ Ajouter note",  colorClass: "text-secondary bg-secondary/10" },
  concours:   { title: "Concours",        sub: "Gestion des concours disponibles",          icon: <MdSchool size={40} />,             btnLabel: "+ Ajouter",       colorClass: "text-success bg-success/10" },
  matieres:   { title: "Matières",        sub: "Gestion des matières enseignées",           icon: <MdBook size={40} />,               btnLabel: "+ Ajouter",       colorClass: "text-warning bg-warning/10" },
  sessions:   { title: "Sessions",        sub: "Gestion des sessions de préparation",       icon: <MdCalendarMonth size={40} />,      btnLabel: "+ Créer session", colorClass: "text-info bg-info/10" },
  annonces:   { title: "Annonces",        sub: "Publications visibles sur le front office", icon: <MdCampaign size={40} />,           btnLabel: "+ Publier",       colorClass: "text-error bg-error/10" },
  profs:      { title: "Professeurs",     sub: "Équipe pédagogique LuXPrepa",               icon: <MdPerson size={40} />,             btnLabel: "+ Ajouter",       colorClass: "text-info bg-info/10" },
  admins:     { title: "Administrateurs", sub: "Comptes d'administration",                  icon: <MdAdminPanelSettings size={40} />, btnLabel: "+ Ajouter",       colorClass: "text-neutral bg-neutral/10" },
  parametres: { title: "Paramètres",      sub: "Configuration générale de la plateforme",   icon: <MdSettings size={40} />,           btnLabel: "",                colorClass: "text-base-content/50 bg-base-200" },
}
 
const PlaceholderPage = ({ page }: PlaceholderPageProps) => {
  const config = pageConfig[page] || pageConfig.parametres
 
  return (
    <div className="space-y-4">
 
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-[22px] font-bold text-base-content"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            {config.title}
          </h2>
          <p className="text-[13px] text-base-content/50 mt-0.5">{config.sub}</p>
        </div>
        {config.btnLabel && (
          <button className="btn btn-sm bg-[#1a7c3e] hover:bg-[#22a052] text-white border-none">
            {config.btnLabel}
          </button>
        )}
      </div>
 
      {/* Placeholder card */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body items-center text-center py-16 gap-4">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${config.colorClass}`}>
            {config.icon}
          </div>
          <div>
            <h3
              className="text-[18px] font-bold text-base-content"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Module {config.title}
            </h3>
            <p className="text-[13px] text-base-content/40 mt-1">
              Ce module est en cours de développement.
            </p>
          </div>
          <div className="badge badge-outline gap-2">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            À venir
          </div>
        </div>
      </div>
    </div>
  )
}
 
export default PlaceholderPage
 