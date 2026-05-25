import { useEffect, useState } from "react"
import {
  MdPeople, MdAssignment, MdPayment, MdTrendingUp,
  MdCheckCircle, MdCreditCard, MdCampaign, MdGrade, MdSchool
} from "react-icons/md"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import toast from "react-hot-toast"
import { inscriptionApi, paiementApi, type Inscription, type Paiement } from "../../services/api"

const paiementsData = [
  { mois: "Jan", montant: 420000 },
  { mois: "Fév", montant: 580000 },
  { mois: "Mar", montant: 390000 },
  { mois: "Avr", montant: 720000 },
  { mois: "Mai", montant: 843000 },
  { mois: "Jun", montant: 650000 },
]

const inscriptionsData = [
  { mois: "Jan", count: 8 },
  { mois: "Fév", count: 14 },
  { mois: "Mar", count: 10 },
  { mois: "Avr", count: 22 },
  { mois: "Mai", count: 18 },
  { mois: "Jun", count: 16 },
]

const annoncesRecentes = [
  { titre: "Session Juin 2026 ouverte", type: "info", date: "Hier" },
  { titre: "Résultats ENSP disponibles", type: "resultat", date: "2 j" },
  { titre: "Alerte : délai paiement", type: "alerte", date: "3 j" },
]

const activites = [
  { icon: <MdCheckCircle size={15} />, color: "text-success bg-success/10", text: <><strong>Emma Kouam</strong> — inscription confirmée ENSPD</>, time: "2 min" },
  { icon: <MdCreditCard size={15} />, color: "text-warning bg-warning/10", text: <><strong>Paiement reçu</strong> — Paul Mbarga 10 000 FCFA</>, time: "4 h" },
  { icon: <MdCampaign size={15} />, color: "text-info bg-info/10", text: <><strong>Annonce publiée</strong> — Session juin 2026</>, time: "Hier" },
  { icon: <MdGrade size={15} />, color: "text-secondary bg-secondary/10", text: <><strong>Note ajoutée</strong> — Sophie Ngo Maths 16/20</>, time: "Hier" },
  { icon: <MdSchool size={15} />, color: "text-success bg-success/10", text: <><strong>Nouvel élève</strong> — Jules Foka inscrit</>, time: "2 j" },
]

const typeAnnonceStyle: Record<string, string> = {
  info: "badge-info",
  resultat: "badge-success",
  alerte: "badge-warning",
}
// ── Stat Card ──
interface StatCardProps {
  label: string
  value: string | number
  sub: string
  icon: React.ReactNode
  colorClass: string
}

const StatCard = ({ label, value, sub, icon, colorClass }: StatCardProps) => (
  <div className="card bg-base-100 shadow-sm">
    <div className="card-body p-5 flex-row items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-base-content/50 font-medium mb-1">{label}</p>
        <h3
          className="text-2xl font-bold text-base-content"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          {value}
        </h3>
        <p className="text-[11px] text-base-content/40 mt-0.5">{sub}</p>
      </div>
    </div>
  </div>
)

const DashboardPage = () => {
  const [inscrits, setInscrits] = useState<Inscription[]>()
  const [nbEleves, setNbEleves] = useState<number>(0)
  const [nbAttenteInscription, setNbAttenteInscription] = useState<number>()
  const [inscriptionsValides, setInscriptionValides] = useState<number>()
  const [paiements, setPaiements] = useState<Paiement[]>()
  const [nbPaiements, setNbPaiements] = useState<number>()
  const getNbElevesInscrits = async () => {
    try {
      const response = await inscriptionApi.liste()
      setInscrits(response)
      setNbEleves(response.length)
      setNbAttenteInscription(response.filter(i => i.status === "en_attente").length)
      setInscriptionValides(response.filter(i => i.status === "validee").length * 100 / response.length)
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  const getPaiements = async () => {
    try {
      const response = await paiementApi.liste()
      setPaiements(response)
      setNbPaiements(response.reduce((acc,n)=>acc + Number(n.montant),0))

    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  useEffect(() => {
    getNbElevesInscrits()
    getPaiements()
  }, [])

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Élèves inscrits" value={nbEleves} sub="+12 ce mois" icon={<MdPeople size={22} />} colorClass="bg-success/10 text-success" />
        <StatCard label="Inscriptions en attente" value={nbAttenteInscription} sub="À traiter" icon={<MdAssignment size={22} />} colorClass="bg-warning/10 text-warning" />
        <StatCard label="Paiements reçus" value={`${nbPaiements} Fcfa`} sub="Ce mois" icon={<MdPayment size={22} />} colorClass="bg-info/10 text-info" />
        <StatCard label="Taux de validation" value={`${inscriptionsValides}%`} sub="Inscriptions confirmées" icon={<MdTrendingUp size={22} />} colorClass="bg-secondary/10 text-secondary" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Paiements */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-5">
            <h3
              className="text-[15px] font-bold text-base-content mb-4"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Paiements mensuels
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={paiementsData}>
                <defs>
                  <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a7c3e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a7c3e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString("fr")} FCFA`, "Montant"]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="montant" stroke="#1a7c3e" strokeWidth={2} fill="url(#colorMontant)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inscriptions */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-5">
            <h3
              className="text-[15px] font-bold text-base-content mb-4"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Inscriptions par mois
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={inscriptionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" name="Inscriptions" fill="#22a052" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Annonces + Activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Annonces récentes — Swiper */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-5">
            <h3
              className="text-[15px] font-bold text-base-content mb-4"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Annonces récentes
            </h3>
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop
              className="w-full"
            >
              {annoncesRecentes.map((ann, i) => (
                <SwiperSlide key={i}>
                  <div className="bg-base-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[13px] font-semibold text-base-content">{ann.titre}</p>
                      <span className={`badge badge-sm ${typeAnnonceStyle[ann.type] || "badge-ghost"}`}>
                        {ann.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-base-content/40">{ann.date}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Activité récente */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-5">
            <h3
              className="text-[15px] font-bold text-base-content mb-4"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Activité récente
            </h3>
            <div className="space-y-3">
              {activites.map((act, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${act.color}`}>
                    {act.icon}
                  </div>
                  <p className="flex-1 text-[13px] text-base-content/70">{act.text}</p>
                  <span className="text-[11px] text-base-content/30 whitespace-nowrap flex-shrink-0">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
