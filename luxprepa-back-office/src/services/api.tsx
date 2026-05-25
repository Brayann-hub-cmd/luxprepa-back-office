const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"

/*
    token orange :
    
    curl -X POST https://api.orange.com/oauth/v3/token \
  -H "Authorization: Basic BASE64(client_id:client_secret)" \
  -d "grant_type=client_credentials"
*/

// ── Utilisateur ──
export interface User {
    id: string
    nom: string
    prenom: string
    telephone: string
    role: "eleve" | "prof" | "admin"
    created_at?: string
}

export interface Prof extends User {
    specialite?: string
}

export interface Eleve extends User {
    date_naissance?: string
    tel_parent?: string,
    niveau?:string
}

// ── Concours ──
export interface Concours {
    id: string
    nom: string
    description?: string
    inscription_prepa: number
    montant_prepa: number
    date_debut: string
    date_fin: string
    nombre_matieres?: number
    nombre_inscrits?: number
    matieres?: MatiereConcours[]
    sessions?: Session[]
}

export interface Matiere {
    id: string
    nom: string
    description?: string
}

export interface CreerMatiereData {
    nom: string
    description?: string
}

export interface ResponseMessage {
    message: string
}

export interface MatiereConcours {
    id: string
    nom: string
    concours: string
    coefficient: number
    matiere_nom: string
    concours_nom: string
}

export interface CreerMatiereConcourData {
    matiere: string
    concours: string
    coefficient: number
}

// ── Session ──
export interface Session {
    id: string
    nom: string
    date?: string
    concours_nom?: string
    nombre_notes?: number
}

// ── Inscription ──
export interface Inscription {
    id: string
    concours: Concours
    status: "en_attente" | "validee" | "rejetee" | "annulee"
    created_at: string
    total_paye: number
    reste_a_payer: number
}

// ── Paiement ──
export interface Paiement {
    id: string
    montant: number
    statut: "en_attente" | "en_cours" | "paye" | "echoue"
    created_at: string
    total_paye: number
    reste_a_payer: number
}

// ── Note ──
export interface Note {
    id: string
    valeur: number
    eleve_nom: string
    prof_nom: string
    matiere_nom: string
    session_nom: string
    created_at: string
}

// ── Annonce ──
export interface Annonce {
    id: string
    titre: string
    contenu: string
    type: "info" | "alerte" | "resultat" | "autre"
    is_public: boolean
    admin_nom: string
    image: string | null
    created_at: string
}

// ── Réponses API ──
export interface ReponseErreur {
    erreurs?: Record<string, string[]>
    erreur?: string
}

export interface ReponsePreInscription {
    message: string
    telephone: string
    expire_dans: string
}

export interface ReponseConfirmation {
    message: string
    token: string
    user: User
}

export interface ReponseConnexion {
    message: string
    token: string
    user: User
}

export interface ReponseCodeReset {
    message: string
    reset_token: string
    telephone: string
}

export const tokenUtils = {
    sauvegarder: (token: string): void => {
        localStorage.setItem("token", token)
    },
    recuperer: (): string | null => {
        return localStorage.getItem("token")
    },
    supprimer: (): void => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    },
    estConnecte: (): boolean => {
        return localStorage.getItem("token") !== null
    },
    sauvegarderUser: (user: User): void => {
        localStorage.setItem("user", JSON.stringify(user))
    },
    sauvegarderEleve: (user: Eleve): void => {
        localStorage.setItem("user", JSON.stringify(user))
    },
    getUser: (): User | null => {
        const data = localStorage.getItem("user")
        if (!data) return null
        return JSON.parse(data) as User
    }
}

function getHeaders(avecToken: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }
    if (avecToken) {
        const token = tokenUtils.recuperer()
        if (token) headers["Authorization"] = `Bearer ${token}`
    }
    return headers
}

function extraireErreur(result: ReponseErreur): string {
    if (result.erreur) return result.erreur
    if (result.erreurs) return Object.values(result.erreurs).flat().join(" | ")
    return "Une erreur est survenue."
}

async function handleResponse<T>(response: Response): Promise<T> {
    const result = await response.json()
    if (!response.ok) throw new Error(extraireErreur(result as ReponseErreur))
    return result as T
}

export const authApi = {
    // ── Étape 1 : Pré-inscription (envoie le code SMS) ──
    preInscription: async (data: {
        nom: string
        prenom: string
        telephone: string
        password: string
        role: "eleve" | "prof" | "admin"
        date_naissance?: string
        tel_parent?: string
        specialite?: string
    }): Promise<ReponsePreInscription> => {
        const response = await fetch(`${BASE_URL}/auth/pre-inscription/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        return handleResponse<ReponsePreInscription>(response)
    },

    // ── Étape 2 : Confirmer le code SMS (crée le compte) ──
    confirmer: async (data: {
        telephone: string
        code: string
    }): Promise<ReponseConfirmation> => {
        const response = await fetch(`${BASE_URL}/auth/confirmer/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        const result = await handleResponse<ReponseConfirmation>(response)
        tokenUtils.sauvegarder(result.token)
        tokenUtils.sauvegarderUser(result.user)
        return result
    },

    // ── Renvoyer le code SMS ──
    renvoyerCode: async (telephone: string): Promise<{ message: string }> => {
        const response = await fetch(`${BASE_URL}/auth/renvoyer-code/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ telephone }),
        })
        return handleResponse<{ message: string }>(response)
    },

    // ── Connexion ──
    connexion: async (data: {
        telephone: string
        password: string
    }): Promise<ReponseConnexion> => {
        const response = await fetch(`${BASE_URL}/auth/connexion/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        const result = await handleResponse<ReponseConnexion>(response)
        tokenUtils.sauvegarder(result.token)
        tokenUtils.sauvegarderUser(result.user)
        return result
    },

    // ── Profil ──
    profil: async (): Promise<User> => {
        const response = await fetch(`${BASE_URL}/auth/profil/`, {
            method: "GET",
            headers: getHeaders(true),
        })
        return handleResponse<User>(response)
    },

    // ── Déconnexion ──
    deconnexion: async (): Promise<void> => {
        await fetch(`${BASE_URL}/auth/deconnexion/`, {
            method: "POST",
            headers: getHeaders(true),
        })
        tokenUtils.supprimer()
    },

    // ── Changer mot de passe (connecté) ──
    changerPassword: async (data: {
        ancien_password: string
        nouveau_password: string
        confirmer_password: string
    }): Promise<{ message: string }> => {
        const response = await fetch(`${BASE_URL}/auth/changer-password/`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        })
        return handleResponse<{ message: string }>(response)
    },

    // ── Mot de passe oublié étape 1 ──
    motDePasseOublie: async (telephone: string): Promise<ReponsePreInscription> => {
        const response = await fetch(`${BASE_URL}/auth/mot-de-passe-oublie/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ telephone }),
        })
        return handleResponse<ReponsePreInscription>(response)
    },

    // ── Mot de passe oublié étape 2 ──
    verifierCodeReset: async (data: {
        telephone: string
        code: string
    }): Promise<ReponseCodeReset> => {
        const response = await fetch(`${BASE_URL}/auth/verifier-code-reset/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        return handleResponse<ReponseCodeReset>(response)
    },

    // ── Mot de passe oublié étape 3 ──
    nouveauPassword: async (data: {
        telephone: string
        reset_token: string
        nouveau_password: string
        confirmer_password: string
    }): Promise<{ message: string }> => {
        const response = await fetch(`${BASE_URL}/auth/nouveau-password/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        })
        return handleResponse<{ message: string }>(response)
    },

    // ── Récupérer user depuis localStorage ──
    getUserLocal: (): User | null => tokenUtils.getUser(),
}

export const matiereApi = {
    liste: async (): Promise<Matiere[]> => {
        const response = await fetch(`${BASE_URL}/matieres/`, {
            method: "GET",
            headers: getHeaders(),
        })
        return handleResponse<Matiere[]>(response)
    },

    detail: async (id: string): Promise<Matiere> => {
        const response = await fetch(`${BASE_URL}/matieres/${id}/`, {
            method: "GET",
            headers: getHeaders(),
        })
        return handleResponse<Matiere>(response)
    },

    creer: async (data: CreerMatiereData): Promise<{ message: string; matiere: Matiere }> => {
        const response = await fetch(`${BASE_URL}/matieres/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data)
        })
        return handleResponse<{ message: string; matiere: Matiere }>(response)
    },

    modifier: async (
        id: string,
        data: Partial<CreerMatiereData>
    ): Promise<{ message: string; matiere: Matiere }> => {
        const response = await fetch(`${BASE_URL}/matieres/${id}/`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(data)
        })
        return handleResponse<{ message: string; matiere: Matiere }>(response)
    },

    supprimer: async (id: string): Promise<ResponseMessage> => {
        const response = await fetch(`${BASE_URL}/matieres/${id}/`, {
            method: "DELETE",
            headers: getHeaders(true)
        })
        return handleResponse<ResponseMessage>(response)
    }
}

export const matiereConcourApi = {
    liste: async (): Promise<MatiereConcours[]> => {
        const response = await fetch(`${BASE_URL}/matiere-concours/`, {
            method: "GET",
            headers: getHeaders(),
        })
        return handleResponse<MatiereConcours[]>(response)
    },
    detail: async (id: string): Promise<MatiereConcours> => {
        const response = await fetch(`${BASE_URL}/matiere-concours/${id}/`, {
            method: "GET",
            headers: getHeaders(),
        })
        return handleResponse<MatiereConcours>(response)
    },
    creer: async (data: CreerMatiereConcourData): Promise<{ message: string, matiere_concours: MatiereConcours }> => {
        const response = await fetch(`${BASE_URL}/matiere-concours/`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data)
        })
        return handleResponse<{ message: string, matiere_concours: MatiereConcours }>(response)
    },
    modifierCoef: async (id: string, coefficient: number): Promise<{ message: string, matiere_concours: MatiereConcours }> => {
        const response = await fetch(`${BASE_URL}/matiere-concours/${id}/`, {
            method: "PATCH",
            headers: getHeaders(true),
            body: JSON.stringify({ coefficient })
        })
        return handleResponse<{ message: string, matiere_concours: MatiereConcours }>(response)
    },
    supprimer: async (id: string): Promise<ResponseMessage> => {
        const response = await fetch(`${BASE_URL}/matiere-concours/${id}/`,{
            method: "DELETE",
            headers: getHeaders(true),
        })
        return handleResponse<ResponseMessage>(response)
    }
}

export const concoursApi = {

    liste: async (): Promise<Concours[]> => {
        const response = await fetch(`${BASE_URL}/concours/`, {
            method: "GET",
            headers: getHeaders(),
        })
        return handleResponse<Concours[]>(response)
    },

    detail: async (id: string): Promise<Concours> => {
        const response = await fetch(`${BASE_URL}/concours/${id}/`, {
            method: "GET",
            headers: getHeaders(),
        })
        return handleResponse<Concours>(response)
    },

    creer: async (data: {
        nom: string
        description?: string
        inscription_prepa: number
        montant_prepa: number
        date_debut: string
        date_fin: string
        matieres: { matiere_id: string; coefficient: number }[]
    }): Promise<{ message: string; concours: Concours }> => {
        const response = await fetch(`${BASE_URL}/concours/`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        })
        return handleResponse<{ message: string; concours: Concours }>(response)
    },

    modifier: async (id: string, data: Partial<{
        nom: string
        description: string
        inscription_prepa: number
        montant_prepa: number
        date_debut: string
        date_fin: string
        matieres: { matiere_id: string; coefficient: number }[]
    }>): Promise<{ message: string; concours: Concours }> => {
        const response = await fetch(`${BASE_URL}/concours/${id}/`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        })
        return handleResponse<{ message: string; concours: Concours }>(response)
    },

    supprimer: async (id: string): Promise<{ message: string }> => {
        const response = await fetch(`${BASE_URL}/concours/${id}/`, {
            method: "DELETE",
            headers: getHeaders(true),
        })
        return handleResponse<{ message: string }>(response)
    },
}

export const inscriptionApi = {

    liste: async (): Promise<Inscription[]> => {
        const response = await fetch(`${BASE_URL}/inscriptions/`, {
            method: "GET",
            headers: getHeaders(true),
        })
        return handleResponse<Inscription[]>(response)
    },

    inscrire: async (concours_id: string): Promise<{ message: string; inscription: Inscription }> => {
        const response = await fetch(`${BASE_URL}/inscriptions/`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify({ concours_id }),
        })
        return handleResponse<{ message: string; inscription: Inscription }>(response)
    },

    valider: async (id: string): Promise<{ message: string; inscription: Inscription }> => {
        const response = await fetch(`${BASE_URL}/inscriptions/${id}/valider/`, {
            method: "PATCH",
            headers: getHeaders(true),
        })
        return handleResponse<{ message: string; inscription: Inscription }>(response)
    },

    annuler: async (id: string): Promise<{ message: string }> => {
        const response = await fetch(`${BASE_URL}/inscriptions/${id}/`, {
            method: "DELETE",
            headers: getHeaders(true),
        })
        return handleResponse<{ message: string }>(response)
    },
}

export const paiementApi = {

    liste: async (): Promise<Paiement[]> => {
        const response = await fetch(`${BASE_URL}/paiements/`, {
            method: "GET",
            headers: getHeaders(true),
        })
        return handleResponse<Paiement[]>(response)
    },

    verser: async (data: {
        inscription_id: string
        montant: number
    }): Promise<{ message: string; paiement: Paiement }> => {
        const response = await fetch(`${BASE_URL}/paiements/`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        })
        return handleResponse<{ message: string; paiement: Paiement }>(response)
    },
}

export const sessionApi = {

    liste: async (): Promise<Session[]> => {
        const response = await fetch(`${BASE_URL}/sessions/`, {
            method: "GET",
            headers: getHeaders(true),
        })
        return handleResponse<Session[]>(response)
    },

    creer: async (data: {
        nom: string
        date: string
        concours_id: string
    }): Promise<{ message: string; session: Session }> => {
        const response = await fetch(`${BASE_URL}/sessions/`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        })
        return handleResponse<{ message: string; session: Session }>(response)
    },

    modifier: async (id: string, data: Partial<{
        nom: string
        date: string
        concours_id: string
    }>): Promise<{ message: string; session: Session }> => {
        const response = await fetch(`${BASE_URL}/sessions/${id}/`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        })
        return handleResponse<{ message: string; session: Session }>(response)
    },

    supprimer: async (id: string): Promise<{ message: string }> => {
        const response = await fetch(`${BASE_URL}/sessions/${id}/`, {
            method: "DELETE",
            headers: getHeaders(true),
        })
        return handleResponse<{ message: string }>(response)
    },
}

export const noteApi = {

    liste: async (): Promise<Note[]> => {
        const response = await fetch(`${BASE_URL}/notes/`, {
            method: "GET",
            headers: getHeaders(true),
        })
        return handleResponse<Note[]>(response)
    },

    affecter: async (data: {
        eleve_id: string
        prof_id: string
        session_id: string
        matiere_concours_id: string
        valeur: number
    }): Promise<{ message: string; note: Note }> => {
        const response = await fetch(`${BASE_URL}/notes/`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        })
        return handleResponse<{ message: string; note: Note }>(response)
    },

    modifier: async (id: string, valeur: number): Promise<{ message: string; note: Note }> => {
        const response = await fetch(`${BASE_URL}/notes/${id}/`, {
            method: "PATCH",
            headers: getHeaders(true),
            body: JSON.stringify({ valeur }),
        })
        return handleResponse<{ message: string; note: Note }>(response)
    },

    supprimer: async (id: string): Promise<{ message: string }> => {
        const response = await fetch(`${BASE_URL}/notes/${id}/`, {
            method: "DELETE",
            headers: getHeaders(true),
        })
        return handleResponse<{ message: string }>(response)
    },
}

export const annonceApi = {

    liste: async (): Promise<Annonce[]> => {
        const response = await fetch(`${BASE_URL}/annonces/`, {
            method: "GET",
            headers: getHeaders(true),
        })
        return handleResponse<Annonce[]>(response)
    },

    creer: async (data: {
        titre: string
        contenu: string
        type: "info" | "alerte" | "resultat" | "autre"
        is_public: boolean
        image?: File
    }): Promise<{ message: string; annonce: Annonce }> => {
        const formData = new FormData()
        formData.append('titre', data.titre)
        formData.append('contenu', data.contenu)
        formData.append('type', data.type)
        formData.append('is_public', String(data.is_public))
        if (data.image) formData.append('image', data.image)
        const token = tokenUtils.recuperer()
        const response = await fetch(`${BASE_URL}/annonces/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData,
        })
        return handleResponse<{ message: string; annonce: Annonce }>(response)
    },

    modifier: async (id: string, data: Partial<{
        titre: string
        contenu: string
        type: "info" | "alerte" | "resultat" | "autre"
        is_public: boolean
    }>): Promise<{ message: string; annonce: Annonce }> => {
        const response = await fetch(`${BASE_URL}/annonces/${id}/`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        })
        return handleResponse<{ message: string; annonce: Annonce }>(response)
    },

    supprimer: async (id: string): Promise<{ message: string }> => {
        const response = await fetch(`${BASE_URL}/annonces/${id}/`, {
            method: "DELETE",
            headers: getHeaders(true),
        })
        return handleResponse<{ message: string }>(response)
    },
}


// ═══════════════════════════════════════════════════════════
// EXEMPLES D'UTILISATION
// ═══════════════════════════════════════════════════════════

/*

// ── INSCRIPTION EN 2 ÉTAPES ──
await authApi.preInscription({ nom: "Kamga", prenom: "Brayann", telephone: "690000000", password: "monpass", role: "eleve" })
const rep = await authApi.confirmer({ telephone: "690000000", code: "123456" })
console.log(rep.user.nom) // connecté directement

// ── CONNEXION ──
const rep = await authApi.connexion({ telephone: "690000000", password: "monpass" })

// ── MOT DE PASSE OUBLIÉ ──
await authApi.motDePasseOublie("690000000")
const { reset_token } = await authApi.verifierCodeReset({ telephone: "690000000", code: "123456" })
await authApi.nouveauPassword({ telephone: "690000000", reset_token, nouveau_password: "newpass", confirmer_password: "newpass" })

// ── CHANGER MOT DE PASSE ──
await authApi.changerPassword({ ancien_password: "old", nouveau_password: "new", confirmer_password: "new" })

// ── CONCOURS ──
const concours = await concoursApi.liste()
const detail = await concoursApi.detail("uuid")

// ── NOTE ──
await noteApi.affecter({ eleve_id: "uuid", prof_id: "uuid", session_id: "uuid", matiere_concours_id: "uuid", valeur: 14.5 })

// ── PAIEMENT ──
await paiementApi.verser({ inscription_id: "uuid", montant: 50000 })

*/