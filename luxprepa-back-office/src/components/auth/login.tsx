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
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
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
      {/* Card */}
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body p-8 gap-6">

          {/* Logo */}
          <div className="flex flex-col items-center">
            <img src={logo} alt="logo" className="h-[36px] w-auto"/>
            <div className="alert alert-warning py-2 px-4">
            <span className="text-[12px]">
              Accès réservé aux <strong>administrateurs</strong> et <strong>professeurs</strong>.
            </span>
          </div>
          </div>

          <div className="divider my-0" />

          {/* Téléphone */}
          <div className="form-control gap-1.5 w-full p-2">
            <label className="label py-0">
              <span className="label-text text-[14px] font-semibold">Numéro de téléphone</span>
            </label>
            <label className={`input input-bordered w-full m-2 flex items-center gap-2 ${erreurTel ? "input-error" : ""}`}>
              <MdPhone size={16} className="text-base-content/40" />
              <input
                type="text"
                placeholder="6XXXXXXXX"
                value={form.telephone}
                onChange={handleTelChange}
                inputMode="numeric"
                className="grow text-[13px] bg-transparent"
              />
              <span className={`text-[11px] font-medium ${form.telephone.length === 9 ? "text-success" : "text-base-content/30"}`}>
                {form.telephone.length}/9
              </span>
            </label>
            {erreurTel && <p className="text-error text-[11px] mt-0.5">{erreurTel}</p>}
          </div>

          {/* Mot de passe */}
          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text text-[14px] font-semibold">Mot de passe</span>
            </label>
            <label className="input w-full m-2 input-bordered flex items-center gap-2">
              <MdLock size={16} className="text-base-content/40" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="grow text-[13px] bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-base-content/30 hover:text-base-content transition-colors"
              >
                {showPassword ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
              </button>
            </label>
          </div>

          {/* Bouton */}
          <button 
            onClick={handleSubmit}
            disabled={loading || !!erreurTel || form.telephone.length < 9 || !form.password}
            className="btn w-full bg-[#1a7c3e] hover:bg-[#22a052] text-white border-none"
          >
            {loading ? <ClipLoader size={18} color="#fff" /> : "Se connecter"}
          </button>
          
        </div>
      </div>
    </div>
  )
}

export default Login