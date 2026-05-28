import {
  MdDashboard, MdPeople, MdAssignment, MdPayment,
  MdGrade, MdSchool, MdBook, MdCalendarMonth,
  MdCampaign, MdPerson, MdAdminPanelSettings,
  MdSettings, MdClose, MdLogout, MdSunny, MdNightlight
} from "react-icons/md"
import type { PageId } from "../../pages/dashboard/AdminDashboard"
import { tokenUtils,eleveApi,inscriptionApi } from "../../services/api"
import toast from "react-hot-toast"
import { useEffect, useState } from "react"
interface NavItem {
  id: PageId
  label: string
  icon: React.ReactNode
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}


interface SidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  isOpen: boolean
  onClose: () => void
  theme: "light" | "dark"
  onToggleTheme: () => void
}

const Sidebar = ({ currentPage, onNavigate, isOpen, onClose, theme, onToggleTheme }: SidebarProps) => {
  const [nbUsers,setNbUsers] = useState<number>(0)
  const [nbInscripts,setNbInscrip] = useState<number>(0)
  const user = tokenUtils.getUser()

  const getNbUser = async() =>{
    try {
      const response = await eleveApi.liste()
      setNbUsers(response.length)
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  const getNbInscriptions = async() =>{
    try {
      const response = await inscriptionApi.liste()
      setNbInscrip(response.length)
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  useEffect(()=>{
    getNbUser()
    getNbInscriptions()
  },[])

  const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <MdDashboard size={16} /> },
      { id: "eleves", label: "Élèves", icon: <MdPeople size={16} />, badge: nbUsers },
      { id: "inscriptions", label: "Inscriptions", icon: <MdAssignment size={16} />, badge: nbInscripts },
      { id: "paiements", label: "Paiements", icon: <MdPayment size={16} /> },
    ]
  },
  {
    label: "Pédagogie",
    items: [
      { id: "notes", label: "Notes", icon: <MdGrade size={16} /> },
      { id: "concours", label: "Concours", icon: <MdSchool size={16} /> },
      { id: "matieres", label: "Matières", icon: <MdBook size={16} /> },
      { id: "sessions", label: "Sessions", icon: <MdCalendarMonth size={16} /> },
    ]
  },
  {
    label: "Communication",
    items: [
      { id: "annonces", label: "Annonces", icon: <MdCampaign size={16} /> },
    ]
  },
  {
    label: "Équipe",
    items: [
      { id: "profs", label: "Professeurs", icon: <MdPerson size={16} /> },
      { id: "admins", label: "Administrateurs", icon: <MdAdminPanelSettings size={16} /> },
      { id: "parametres", label: "Paramètres", icon: <MdSettings size={16} /> },
    ]
  },
]


  const getInitials = () => {
    if (!user) return "AD"
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
  }

  return (
    <aside className={`
      w-[220px] min-w-[220px] bg-[#0a0a0a] flex flex-col h-screen overflow-y-auto z-10
      transition-transform duration-300 ease-in-out
      fixed lg:relative
      ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}>

      {/* Brand */}
      <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-start justify-between">
        <div>
          <h2 className="text-[18px] font-bold" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            <span className="text-[#22a052]">Lu</span>
            <em className="text-[#22a052] not-italic">X</em>
            <strong className="text-white font-bold">Prepa</strong>
          </h2>
          <p className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-widest">Espace Administrateurs</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden w-7 h-7 bg-[#1a1a1a] rounded-md flex items-center justify-center text-[#666] hover:text-white transition-colors"
        >
          <MdClose size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#333] px-2.5 mb-1.5">
              {group.label}
            </p>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                  text-[13px] font-medium cursor-pointer transition-all duration-150 mb-0.5
                  ${currentPage === item.id
                    ? "bg-[#1a7c3e] text-white"
                    : "text-[#666] hover:bg-white/5 hover:text-[#ccc]"
                  }
                `}
              >
                <span className="w-[18px] flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`
                    text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                    ${currentPage === item.id
                      ? "bg-white/25 text-white"
                      : "bg-white/10 text-[#999]"
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-4 py-3 border-t border-[#1a1a1a]">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#666] hover:bg-white/5 hover:text-[#ccc] transition-all duration-150 text-[13px] font-medium"
        >
          {theme === "light"
            ? <><MdNightlight size={16} color="blue"/><span>Mode nuit</span></>
            : <><MdSunny size={16} color="orange"/><span>Mode jour</span></>
          }
        </button>
      </div>

      {/* User */}
      <div className="px-4 py-3.5 border-t border-[#1a1a1a] flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] bg-[#1a7c3e] rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
          {getInitials()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[12px] font-semibold truncate">
            {user ? `${user.prenom} ${user.nom}` : "Admin"}
          </p>
          <p className="text-[#444] text-[10px]">Administrateur</p>
        </div>
        <button
          onClick={() => { tokenUtils.supprimer(); window.location.href = "/login" }}
          className="p-1 rounded-md hover:bg-white/5 transition-colors flex-shrink-0"
          title="Déconnexion"
        >
          <MdLogout size={15} className="text-[#666]" />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
