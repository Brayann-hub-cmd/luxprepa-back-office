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
import { inscriptionApi, paiementApi, annonceApi, activiteApi, type Inscription, type Paiement, type Annonce, type Activite } from "../../services/api"
const typeAnnonceStyle: Record<string, string> = {
  info: "badge-info",
  resultat: "badge-success",
  alerte: "badge-warning",
}

const getActiviteIcon = (type: string) => {
  const map: Record<string, { icon: React.ReactNode; colorClass: string }> = {
    inscription: { icon: <MdCheckCircle size={15} />, colorClass: "text-success bg-success/10" },
    paiement: { icon: <MdCreditCard size={15} />, colorClass: "text-warning bg-warning/10" },
    note: { icon: <MdGrade size={15} />, colorClass: "text-secondary bg-secondary/10" },
    annonce: { icon: <MdCampaign size={15} />, colorClass: "text-info bg-info/10" },
    compte: { icon: <MdSchool size={15} />, colorClass: "text-success bg-success/10" },
  }
  return map[type] || {icon:<MdAssignment size={15}/>}
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
const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
};

const DashboardPage = () => {
  const [inscrits, setInscrits] = useState<Inscription[]>([])
  const [nbEleves, setNbEleves] = useState<number>(0)
  const [nbAttenteInscription, setNbAttenteInscription] = useState<number>(0)
  const [inscriptionsValides, setInscriptionValides] = useState<number>(0)
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [actRecentes, setActRecentes] = useState<Activite[]>([])
  const getNbElevesInscrits = async () => {
    try {
      const response = await inscriptionApi.liste()
      setInscrits(response)
      setNbEleves(response.length)
      setNbAttenteInscription(response.filter(i => i.status === "en_attente").length)
      setInscriptionValides(Math.round(response.filter(i => i.status === "validee").length * 100 / response.length))
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

  const getAnnonces = async () => {
    try {
      const response = await annonceApi.liste()
      setAnnonces(response.slice(0, 5))
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  const getActiviteRecentes = async () => {
    try {
      const response = await activiteApi.liste()
      setActRecentes(response.slice(0, 5))
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
    getAnnonces()
    getActiviteRecentes()
  }, [])

  const nbElevesCeMois = compterInscriptionCeMois(inscrits)
  const mtPaiementCeMois = montantPaiementCeMois(paiements)

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Élèves inscrits" value={nbEleves} sub={nbElevesCeMois && `+ ${nbElevesCeMois} ce mois` || '+0 ce mois'} icon={<MdPeople size={22} />} colorClass="bg-success/10 text-success" />
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
              {annonces.map((ann, i) => (
                <SwiperSlide key={i}>
                  <div className="bg-base-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[13px] font-semibold text-base-content">{ann.titre}</p>
                      <span className={`badge badge-sm ${typeAnnonceStyle[ann.type] || "badge-ghost"}`}>
                        {ann.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-base-content/40">{timeAgo(ann.created_at)}</p>
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
              Activités récentes
            </h3>
            <div className="space-y-3">
              {actRecentes.map((act, i) => {
                const { icon, colorClass } = getActiviteIcon(act.type_act)
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      {icon}
                    </div>
                    <p className="flex-1 text-[13px] text-base-content/70">{act.message}</p>
                    <span className="text-[11px] text-base-content/30 whitespace-nowrap flex-shrink-0">
                      {act.temps}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
