import { useState } from "react"
import { MdMenu, MdSearch, MdNotifications, MdRefresh } from "react-icons/md"
import { tokenUtils } from '../../services/api'

interface TopbarProps {
  title: string
  onMenuClick: () => void
}
 
const Topbar = ({ title, onMenuClick }: TopbarProps) => {
  const [search, setSearch] = useState("")
  const user = tokenUtils.getUser()
 
  const getInitials = () => {
    if (!user) return "AD"
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
  }
 
  return (
    <header className="bg-base-100 border-b border-base-200 px-7 h-[60px] flex items-center justify-between flex-shrink-0 sticky top-0 z-[5]">
 
      {/* Left */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-sm lg:hidden w-[38px] h-[38px] p-0"
        >
          <MdMenu size={20} />
        </button>
        <h1
          className="text-[20px] font-bold text-base-content"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          {title}
        </h1>
      </div>
 
      {/* Right */}
      <div className="flex items-center gap-2.5">
 
        {/* Search */}
        <label className="input input-bordered input-sm flex items-center gap-2 min-w-[220px] hidden md:flex">
          <MdSearch size={16} className="text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="grow text-[13px] bg-transparent"
          />
        </label>
 
        {/* Refresh */}
        <button
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => window.location.reload()}
          title="Actualiser"
        >
          <MdRefresh size={18} />
        </button>
 
        {/* Notifications */}
        <div className="indicator">
          <span className="indicator-item badge badge-success badge-xs" />
          <button className="btn btn-ghost btn-sm btn-square" title="Notifications">
            <MdNotifications size={18} />
          </button>
        </div>
 
        {/* Avatar */}
        <div
          className="w-[34px] h-[34px] bg-[#1a7c3e] rounded-full flex items-center justify-center text-white text-[12px] font-bold cursor-pointer flex-shrink-0"
          title={user ? `${user.prenom} ${user.nom}` : "Admin"}
        >
          {getInitials()}
        </div>
      </div>
    </header>
  )
}
 
export default Topbar
 