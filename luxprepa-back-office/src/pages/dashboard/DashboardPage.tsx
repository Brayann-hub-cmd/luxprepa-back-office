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
  const [inscrits, setInscrits] = useState<Inscription[]>([])
  const [nbEleves, setNbEleves] = useState<number>(0)
  const [nbAttenteInscription, setNbAttenteInscription] = useState<number>()
  const [inscriptionsValides, setInscriptionValides] = useState<number>()
  const [paiements, setPaiements] = useState<Paiement[]>([])

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
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  const compterInscriptionCeMois = (inscriptions: Inscription[]): number => {
    const maintenant = new Date()
    return inscriptions.filter(ins => {
      const date = new Date(ins.created_at)
      return (
        date.getMonth() === maintenant.getMonth() && date.getFullYear() === maintenant.getFullYear()
      )
    }).length
  }

  const montantPaiementCeMois = (paiements: Paiement[]): number => {
    const maintenant = new Date()
    return paiements.filter(
      p => {
        const date = new Date(p.created_at)
        return (
          date.getMonth() === maintenant.getMonth() &&
          date.getFullYear() === maintenant.getFullYear()
        )
      }
    ).reduce((total, p) => total + p.montant, 0)
  }

  const formaterMontant = (montant: number): string => new Intl.NumberFormat("fr-CM").format(montant)

  const paiementsParSemaine = (paiements: Paiement[]) => {
    const maintenant = new Date()
    const annee = maintenant.getFullYear()
    const mois = maintenant.getMonth()

    // Générer les 4 semaines du mois actuel
    const semaines = [1, 2, 3, 4].map(num => ({
      semaine: `Sem ${num}`,
      montant: 0
    }))

    paiements.forEach(p => {
      const date = new Date(p.created_at)

      // Vérifier que c'est bien ce mois-ci et cette année
      if (date.getMonth() !== mois || date.getFullYear() !== annee) return

      // Déterminer le numéro de semaine dans le mois (1 à 4)
      const jourDuMois = date.getDate()
      const numSemaine = Math.ceil(jourDuMois / 7) - 1  // index 0 à 3

      if (numSemaine >= 0 && numSemaine < 4) {
        semaines[numSemaine].montant += p.montant
      }
    })

    return semaines
  }

  const inscriptionsParSemaine = (inscrits: Inscription[]) => {
    const maintenant = new Date()
    const annee = maintenant.getFullYear()
    const mois = maintenant.getMonth()

    // Générer les 4 semaines du mois actuel
    const semaines = [1, 2, 3, 4].map(num => ({
      semaine: `Sem ${num}`,
      count: 0
    }))

    inscrits.forEach(p => {
      const date = new Date(p.created_at)

      // Vérifier que c'est bien ce mois-ci et cette année
      if (date.getMonth() !== mois || date.getFullYear() !== annee) return

      // Déterminer le numéro de semaine dans le mois (1 à 4)
      const jourDuMois = date.getDate()
      const numSemaine = Math.ceil(jourDuMois / 7) - 1  // index 0 à 3

      if (numSemaine >= 0 && numSemaine < 4) {
        semaines[numSemaine].count += 1
      }
    })

    return semaines
  }

  const dataPaiements = paiementsParSemaine(paiements)
  const dataInscriptions = inscriptionsParSemaine(inscrits)

  useEffect(() => {
    getNbElevesInscrits()
    getPaiements()
  }, [])

  const nbElevesCeMois = compterInscriptionCeMois(inscrits)
  const mtPaiementCeMois = montantPaiementCeMois(paiements)

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Élèves inscrits" value={nbEleves} sub={nbElevesCeMois && `+ ${nbElevesCeMois} ce mois`} icon={<MdPeople size={22} />} colorClass="bg-success/10 text-success" />
        <StatCard label="Inscriptions en attente" value={nbAttenteInscription} sub="À traiter" icon={<MdAssignment size={22} />} colorClass="bg-warning/10 text-warning" />
        <StatCard label="Paiements reçus" value={`${formaterMontant(mtPaiementCeMois)} Fcfa`} sub="Ce mois" icon={<MdPayment size={22} />} colorClass="bg-info/10 text-info" />
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
              Paiements par semaines
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dataPaiements}>
                <defs>
                  <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a7c3e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a7c3e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
                <XAxis dataKey="semaine" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => [formaterMontant(v), "Montant"]}
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
              Inscriptions par semaines
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataInscriptions}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
                <XAxis dataKey="semaine" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
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
