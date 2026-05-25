import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"
import Sidebar from "../../components/layout/Sidebar"
import Topbar from "../../components/layout/Topbar"
import DashboardPage from "./DashboardPage"
import ElevesPage from "../users/ElevePage"
import InscriptionsPage from "../inscriptions/inscriptions"
import ListeAnnonces from "../annonces/annonces"
import PlaceholderPage from "./PlaceholderPage"
import ListeMatieres from "../matieres/matieres"
import ListeSessions from "../sessions/sessions"
export type PageId =
  | "dashboard" | "eleves" | "inscriptions" | "paiements"
  | "notes" | "concours" | "matieres" | "sessions"
  | "annonces" | "profs" | "admins" | "parametres"

export const pageTitles: Record<PageId, string> = {
  dashboard: "Dashboard",
  eleves: "Élèves",
  inscriptions: "Inscriptions",
  paiements: "Paiements",
  notes: "Notes",
  concours: "Concours",
  matieres: "Matières",
  sessions: "Sessions",
  annonces: "Annonces",
  profs: "Professeurs",
  admins: "Administrateurs",
  parametres: "Paramètres",
}

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  )

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <DashboardPage />
      case "eleves": return <ElevesPage />
      case "inscriptions": return <InscriptionsPage />
      case "annonces": return <ListeAnnonces />
      case "matieres": return <ListeMatieres />
      case "sessions": return <ListeSessions />
      default: return <PlaceholderPage page={currentPage} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-base-200 font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "13px",
          },
        }}
      />

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false) }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <Topbar
          title={pageTitles[currentPage]}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard