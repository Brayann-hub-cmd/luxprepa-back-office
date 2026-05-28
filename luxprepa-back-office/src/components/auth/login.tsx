import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MdPhone, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md"
import { ClipLoader } from "react-spinners"
import toast from "react-hot-toast"
import { authApi } from "../../services/api"
import logo from '../../assets/logo.jpg'
import { Toaster } from "react-hot-toast"

const Login = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({ telephone: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreurTel, setErreurTel] = useState<string | null>(null)

  const validerTelephone = (tel: string): string | null => {
    if (tel.length === 0) return null
    if (!/^\d+$/.test(tel)) return "Chiffres uniquement."
    if (tel[0] !== "6") return "Doit commencer par 6."
    if (tel.length < 9) return "9 chiffres requis."
    return null
  }

  const handleTelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "")
    if (val.length > 9) return
    setForm({ ...form, telephone: val })
    setErreurTel(validerTelephone(val))
  }

  const handleSubmit = async () => {
    const errTel = validerTelephone(form.telephone)
    if (errTel) { setErreurTel(errTel); return }
    if (!form.password) { toast.error("Mot de passe requis."); return }

    setLoading(true)
    try {
      const rep = await authApi.connexion(form)

      if (rep.user.role !== "admin" && rep.user.role !== "prof") {
        authApi.deconnexion()
        setTimeout(()=>toast.error("Accès réservé aux administrateurs et professeurs."),1500)
        return
      }

      toast.success(`Bienvenue ${rep.user.prenom} !`)
      navigate("/admin")
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
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
      {/* Card principale */}
      <div className="card bg-white shadow-2xl w-full max-w-md rounded-2xl overflow-hidden border border-gray-100">
        {/* Bannière décorative */}
        <div className="bg-gradient-to-r from-[#1a7c3e] to-[#22a052] h-3" />

        <div className="card-body p-8 gap-6">
          {/* Logo et sous-titre */}
          <div className="flex flex-col items-center gap-2">
            <img src={logo} alt="logo" className="h-12 w-auto" />
            <h2 className="text-xl font-bold text-gray-800 mt-2">Espace sécurisé</h2>
            <div className="alert alert-soft bg-yellow-50 border-l-4 border-yellow-400 py-2 px-4 rounded-lg">
              <span className="text-xs text-gray-600">
                🔒 Accès réservé aux <strong>administrateurs</strong> et <strong>professeurs</strong>.
              </span>
            </div>
          </div>

          <div className="divider my-0 text-gray-300" />

          {/* Téléphone */}
          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text text-sm font-semibold text-gray-700">Numéro de téléphone</span>
            </label>
            <div className={`flex items-center gap-2 input input-bordered w-full rounded-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-green-400 ${erreurTel ? "input-error ring-red-400" : ""}`}>
              <MdPhone size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="6XXXXXXXX"
                value={form.telephone}
                onChange={handleTelChange}
                inputMode="numeric"
                className="grow text-sm bg-transparent outline-none"
              />
              <span className={`text-xs font-medium mr-1 ${form.telephone.length === 9 ? "text-green-500" : "text-gray-400"}`}>
                {form.telephone.length}/9
              </span>
            </div>
            {erreurTel && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span>{erreurTel}</p>}
          </div>

          {/* Mot de passe */}
          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text text-sm font-semibold text-gray-700">Mot de passe</span>
            </label>
            <div className="flex items-center gap-2 input input-bordered w-full rounded-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-green-400">
              <MdLock size={18} className="text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="grow text-sm bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <button
                onClick={() => toast("Fonctionnalité à venir")}
                className="text-xs text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          {/* Bouton de connexion */}
          <button 
            onClick={handleSubmit}
            disabled={loading || !!erreurTel || form.telephone.length < 9 || !form.password}
            className="btn w-full bg-gradient-to-r from-[#1a7c3e] to-[#22a052] hover:from-[#22a052] hover:to-[#2db85c] text-white border-none rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <ClipLoader size={20} color="#fff" /> : "Se connecter"}
          </button>

          {/* Mention légale */}
          <p className="text-center text-xs text-gray-400 mt-2">
            &copy; {new Date().getFullYear()} - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
