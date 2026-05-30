import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ClipLoader } from 'react-spinners'
import {
    sessionApi, noteApi, inscriptionApi, matiereConcourApi,
    authApi,
    type Session, type MatiereConcours, type Note, type Inscription,type User
} from '../../services/api'

type Step = 'session' | 'matiere' | 'notes'

const NotesPage = () => {
    const user = authApi.getUserLocal() as User
    const [sessions, setSessions] = useState<Session[]>([])
    const [selectedSession, setSelectedSession] = useState<Session | null>(null)
    const [matieres, setMatieres] = useState<MatiereConcours[]>([])
    const [selectedMatiere, setSelectedMatiere] = useState<MatiereConcours | null>(null)
    const [eleves, setEleves] = useState<Inscription[]>([])
    const [notes, setNotes] = useState<Record<string, number>>({}) // eleve_nom → valeur
    const [notesExistantes, setNotesExistantes] = useState<Note[]>([])
    const [step, setStep] = useState<Step>('session')
    const [loadingEleves, setLoadingEleves] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    // const [lienResultats, setLienResultats] = useState('')
    const genererLienPublic = () => {
        if (!selectedSession?.id) return;
        const lien = `${window.location.origin}/resultats-session/${selectedSession.id}/`;
        navigator.clipboard.writeText(lien);
        alert(`Lien public copié :\n${lien}`);
    };

    // ── Étape 1 : sessions ──
    useEffect(() => {
        sessionApi.liste()
            .then(setSessions)
            .catch(() => toast.error('Erreur chargement des sessions'))
    }, [])

    // ── Étape 2 : matières du concours de la session ──
    useEffect(() => {
        if (!selectedSession) {
            setMatieres([])
            setSelectedMatiere(null)
            setEleves([])
            setNotes({})
            setNotesExistantes([])
            return
        }
        matiereConcourApi.liste()
            .then(data => {
                const filtered = data.filter(m => m.concours_nom === selectedSession.concours_nom)
                setMatieres(filtered)
            })
            .catch(() => toast.error('Erreur chargement des matières'))
    }, [selectedSession])

    // ── Étape 3 : élèves + notes existantes ──
    useEffect(() => {
        if (!selectedSession || !selectedMatiere) return

        setStep('notes')
        setEleves([])
        setNotes({})
        setNotesExistantes([])
        setLoadingEleves(true)

        const charger = async () => {
            try {
                // Élèves = inscriptions validées au concours de cette session
                const toutesInscriptions = await inscriptionApi.liste()
                const elevesSession = toutesInscriptions.filter(
                    i => i.concours.nom === selectedSession.concours_nom
                        && i.status === 'validee'
                )
                setEleves(elevesSession)

                // Notes existantes via query params — session_id + matiere_concours_id
                const notesData = await noteApi.getBySessionAndMatiere(
                    selectedSession.id,
                    selectedMatiere.id
                )
                setNotesExistantes(notesData)

                const initNotes: Record<string, number> = {}
                notesData.forEach(note => {
                    initNotes[note.eleve_nom] = note.valeur
                })
                setNotes(initNotes)

            } catch (error) {
                toast.error('Erreur chargement des élèves ou des notes')
                console.log(error);

            } finally {
                setLoadingEleves(false)
            }
        }

        charger()
    }, [selectedSession, selectedMatiere])

    // ── Saisie note ──
    const handleNoteChange = (eleveNom: string, value: string) => {
        const num = parseFloat(value)
        if (value !== '' && (isNaN(num) || num < 0)) {
            toast.error('La note doit être supérieure à 0')
            return
        }
        setNotes(prev => ({ ...prev, [eleveNom]: isNaN(num) ? undefined as unknown as number : num }))
    }

    // ── Soumission ──
    const handleSubmitAll = async () => {
        if (!selectedSession || !selectedMatiere || !user) return
        setSubmitting(true)
        try {
            const promises = eleves.map(async insc => {
                const valeur = notes[insc.eleve_nom]
                if (valeur === undefined || isNaN(valeur)) return

                // Chercher note existante par eleve_nom (même format garanti)
                const noteExistante = notesExistantes.find(
                    n => n.eleve_nom === insc.eleve_nom
                        && n.matiere_nom === selectedMatiere.matiere_nom   // ou matiere_concours_id si disponible
                );

                if (noteExistante) {
                    return noteApi.modifier(noteExistante.id, valeur)
                } else {
                    return noteApi.affecter({
                        eleve_id: insc.eleve_id,
                        prof_id: user.id,
                        session_id: selectedSession.id,
                        matiere_concours_id: selectedMatiere.id,
                        valeur,
                    })
                }
            })

            await Promise.all(promises.filter(Boolean))
            toast.success('Notes enregistrées avec succès !')

            // Recharger les notes existantes pour mettre à jour les badges
            const notesRefresh = await noteApi.getBySessionAndMatiere(
                selectedSession.id,
                selectedMatiere.id
            )
            setNotesExistantes(notesRefresh)

            // const token = btoa(`${selectedSession.id}-${selectedMatiere.id}`)
            // setLienResultats(`${window.location.origin}/resultats?token=${token}`)
        } catch(error) {
            if (error instanceof Error) toast.error(error.message)
            toast.error("Erreur lors de l'enregistrement des notes")
        } finally {
            setSubmitting(false)
        }
    }

    // const copierLien = () => {
    //     navigator.clipboard.writeText(lienResultats)
    //     toast.success('Lien copié !')
    // }

    const nbNotesSaisies = eleves.filter(i => {
        const v = notes[i.eleve_nom]
        return v !== undefined && !isNaN(v)
    }).length

    return (
        <div className="space-y-4 max-w-4xl">

            {/* Header */}
            <div>
                <h2
                    className="text-[22px] font-bold text-base-content"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                    Saisie des notes
                </h2>
                <p className="text-[13px] text-base-content/50 mt-0.5">
                    Sélectionnez une session puis une matière pour saisir les notes
                </p>
            </div>

            {/* ── Étape 1 : Session ── */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-5 space-y-3">
                    <h3 className="font-semibold text-[14px] text-base-content flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#1a7c3e] text-white text-[11px] flex items-center justify-center font-bold">1</span>
                        Choisir une session
                    </h3>
                    <select
                        className="select select-bordered select-sm w-full max-w-sm"
                        value={selectedSession?.id || ''}
                        onChange={e => {
                            const session = sessions.find(s => s.id === e.target.value) || null
                            setSelectedSession(session)
                            setSelectedMatiere(null)
                            setStep(session ? 'matiere' : 'session')
                        }}
                    >
                        <option value="">Sélectionner une session</option>
                        {sessions.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.nom}{s.date ? ` — ${new Date(s.date).toLocaleDateString('fr-FR')}` : ''}
                                {s.concours_nom ? ` (${s.concours_nom})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Étape 2 : Matière ── */}
            {step !== 'session' && selectedSession && (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body p-5 space-y-3">
                        <h3 className="font-semibold text-[14px] text-base-content flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#1a7c3e] text-white text-[11px] flex items-center justify-center font-bold">2</span>
                            Choisir une matière
                        </h3>
                        {matieres.length === 0 ? (
                            <p className="text-[13px] text-base-content/40">
                                Aucune matière trouvée pour ce concours.
                            </p>
                        ) : (
                            <select
                                className="select select-bordered select-sm w-full max-w-sm"
                                value={selectedMatiere?.id || ''}
                                onChange={e => {
                                    const matiere = matieres.find(m => m.id === e.target.value) || null
                                    setSelectedMatiere(matiere)
                                }}
                            >
                                <option value="">Sélectionner une matière</option>
                                {matieres.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.matiere_nom} — coef {m.coefficient}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            )}

            {/* ── Étape 3 : Notes ── */}
            {step === 'notes' && selectedSession && selectedMatiere && (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body p-5 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="font-semibold text-[14px] text-base-content flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#1a7c3e] text-white text-[11px] flex items-center justify-center font-bold">3</span>
                                {selectedMatiere.matiere_nom}
                                <span className="text-base-content/40 font-normal text-[12px]">
                                    coef {selectedMatiere.coefficient}
                                </span>
                            </h3>
                            <span className="text-[12px] text-base-content/50">
                                {nbNotesSaisies}/{eleves.length} notes saisies
                            </span>
                        </div>

                        {loadingEleves ? (
                            <div className="flex justify-center py-10">
                                <ClipLoader size={28} color="#1a7c3e" />
                            </div>
                        ) : eleves.length === 0 ? (
                            <p className="text-center py-8 text-base-content/40 text-[14px]">
                                Aucun élève validé pour ce concours.
                            </p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr className="bg-base-200/50">
                                                <th className="text-[12px] font-semibold text-base-content/50 w-8">#</th>
                                                <th className="text-[12px] font-semibold text-base-content/50">Élève</th>
                                                <th className="text-[12px] font-semibold text-base-content/50">Note /20</th>
                                                <th className="text-[12px] font-semibold text-base-content/50">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eleves.map((insc, index) => {
                                                const valeur = notes[insc.eleve_nom]
                                                const aNote = valeur !== undefined && !isNaN(valeur)
                                                const estModif = notesExistantes.some(
                                                    n => n.eleve_nom === insc.eleve_nom
                                                )

                                                return (
                                                    <tr key={insc.eleve_id} className="hover:bg-base-200/30 transition-colors">
                                                        <td className="text-[13px] text-base-content/40">{index + 1}</td>
                                                        <td className="font-medium text-[13px] text-base-content">
                                                            {insc.eleve_nom}
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={20}
                                                                step={0.25}
                                                                value={aNote ? valeur : ''}
                                                                onChange={e => handleNoteChange(insc.eleve_nom, e.target.value)}
                                                                className="input input-bordered input-sm w-24 text-[13px]"
                                                                placeholder="—"
                                                            />
                                                        </td>
                                                        <td>
                                                            {estModif && aNote ? (
                                                                <span className="badge badge-sm badge-warning text-[11px]">Modifier</span>
                                                            ) : aNote ? (
                                                                <span className="badge badge-sm badge-success text-[11px]">Prêt</span>
                                                            ) : (
                                                                <span className="badge badge-sm badge-ghost text-[11px]">Vide</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        className="btn btn-sm bg-[#1a7c3e] hover:bg-[#22a052] text-white border-none gap-2"
                                        onClick={handleSubmitAll}
                                        disabled={submitting || nbNotesSaisies === 0}
                                    >
                                        {submitting
                                            ? <span className="loading loading-spinner loading-xs" />
                                            : `Enregistrer ${nbNotesSaisies} note${nbNotesSaisies > 1 ? 's' : ''}`
                                        }
                                    </button>
                                </div>

                                <button
                                    onClick={genererLienPublic}
                                    className="btn btn-sm btn-success mt-2"
                                >
                                    Publier les résultats
                                </button>

                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotesPage
