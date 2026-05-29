// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import { FiSearch,FiX,FiChevronDown,FiCheckCircle,FiAlertCircle,FiLoader } from 'react-icons/fi';
// interface Eleve {
//   id: string;
//   nom: string;
//   prenom: string;
//   email?: string;
// }

// interface Concours {
//   id: string;
//   nom: string;
//   date_limite?: string;
// }

// const EleveSearch: React.FC<{
//   value: Eleve | null;
//   onChange: (eleve: Eleve | null) => void;
//   onFocus?: () => void;
// }> = ({ value, onChange, onFocus }) => {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState<Eleve[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [open, setOpen] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const searchEleves = useCallback(async (q: string) => {
//     if (q.length < 2) {
//       setResults([]);
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/eleves?search=${encodeURIComponent(q)}`);
//       const data = await res.json();
//       setResults(data);
//     } catch {
//       setResults([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value;
//     setQuery(val);
//     setOpen(true);
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => searchEleves(val), 300);
//   };

//   const selectEleve = (eleve: Eleve) => {
//     onChange(eleve);
//     setQuery(`${eleve.prenom} ${eleve.nom}`);
//     setOpen(false);
//   };

//   const clearSelection = () => {
//     onChange(null);
//     setQuery('');
//     setResults([]);
//     inputRef.current?.focus();
//   };

//   useEffect(() => {
//     if (!open) setResults([]);
//   }, [open]);

//   return (
//     <div className="relative">
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Élève
//       </label>
//       <div className={`relative flex items-center border rounded-lg transition-all duration-200 ${
//         open ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-gray-400'
//       }`}>
//         <FiSearch className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
//         <input
//           ref={inputRef}
//           type="text"
//           placeholder="Rechercher un élève..."
//           value={query}
//           onChange={handleInput}
//           onFocus={() => { setOpen(true); onFocus?.(); }}
//           onBlur={() => setTimeout(() => setOpen(false), 150)}
//           className="w-full pl-10 pr-10 py-2.5 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
//         />
//         {value && (
//           <button onClick={clearSelection} className="absolute right-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
//             <FiX className="h-4 w-4 text-gray-500" />
//           </button>
//         )}
//         {loading && !value && (
//           <FiLoader className="absolute right-2 h-5 w-5 text-indigo-500 animate-spin" />
//         )}
//       </div>

//       {/* Suggestions dropdown */}
//       {open && results.length > 0 && (
//         <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
//           {results.map(eleve => (
//             <li
//               key={eleve.id}
//               onMouseDown={() => selectEleve(eleve)}
//               className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors"
//             >
//               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
//                 {eleve.prenom[0]}{eleve.nom[0]}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-900 truncate">{eleve.prenom} {eleve.nom}</p>
//                 {eleve.email && <p className="text-xs text-gray-500 truncate">{eleve.email}</p>}
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* Pas de résultats */}
//       {open && query.length >= 2 && !loading && results.length === 0 && (
//         <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500 text-sm">
//           Aucun élève trouvé
//         </div>
//       )}
//     </div>
//   );
// };

// const ConcoursSelect: React.FC<{
//   value: Concours | null;
//   onChange: (concours: Concours | null) => void;
// }> = ({ value, onChange }) => {
//   const [concoursList, setConcoursList] = useState<Concours[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchConcours = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch('/api/concours/');
//         if (!res.ok) throw new Error('Erreur chargement');
//         const data = await res.json();
//         setConcoursList(data);
//       } catch (e: any) {
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchConcours();
//   }, []);

//   return (
//     <div className="relative">
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Concours
//       </label>
//       <div className={`relative border rounded-lg transition-all duration-200 ${
//         value ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-300 hover:border-gray-400'
//       }`}>
//         <select
//           value={value?.id || ''}
//           onChange={(e) => {
//             const selected = concoursList.find(c => c.id === e.target.value) || null;
//             onChange(selected);
//           }}
//           className="w-full px-4 py-2.5 bg-transparent outline-none text-sm text-gray-700 appearance-none cursor-pointer"
//         >
//           <option value="">Choisir un concours...</option>
//           {concoursList.map(c => (
//             <option key={c.id} value={c.id}>{c.nom}</option>
//           ))}
//         </select>
//         <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//       </div>
//       {loading && (
//         <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
//           <FiLoader className="h-4 w-4 animate-spin" />
//           Chargement...
//         </div>
//       )}
//       {error && (
//         <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
//           <FiAlertCircle className="h-4 w-4" />
//           {error}
//         </div>
//       )}
//     </div>
//   );
// };

// const AdminInscriptionForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
//   const [eleve, setEleve] = useState<Eleve | null>(null);
//   const [concours, setConcours] = useState<Concours | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setMessage(null);

//     if (!eleve) {
//       setMessage({ type: 'error', text: 'Veuillez sélectionner un élève.' });
//       return;
//     }
//     if (!concours) {
//       setMessage({ type: 'error', text: 'Veuillez sélectionner un concours.' });
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const token = localStorage.getItem('token'); // adapte
//       const res = await fetch('/api/admin/inscriptions/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ eleve_id: eleve.id, concours_id: concours.id }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setMessage({ type: 'success', text: data.message || 'Inscription réussie !' });
//         setEleve(null);
//         setConcours(null);
//         onSuccess?.();
//       } else {
//         setMessage({ type: 'error', text: data.detail || data.message || 'Erreur inconnue' });
//       }
//     } catch (err: any) {
//       setMessage({ type: 'error', text: 'Erreur réseau ou serveur.' });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto py-8 px-4">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100">
//         <div className="text-center">
//           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
//             <FiCheckCircle className="h-8 w-8 text-white" />
//           </div>
//           <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//             Inscription administrateur
//           </h2>
//           <p className="text-gray-500 text-sm mt-1">
//             Ajoutez un élève à un concours en toute simplicité
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <EleveSearch value={eleve} onChange={setEleve} />
//           <ConcoursSelect value={concours} onChange={setConcours} />

//           <button
//             type="submit"
//             disabled={submitting || !eleve || !concours}
//             className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
//               submitting || !eleve || !concours
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
//             }`}
//           >
//             {submitting ? (
//               <>
//                 <FiLoader className="h-5 w-5 animate-spin" />
//                 Inscription en cours...
//               </>
//             ) : (
//               <>
//                 <FiCheckCircle className="h-5 w-5" />
//                 Inscrire
//               </>
//             )}
//           </button>
//         </form>

//         {message && (
//           <div className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
//             message.type === 'success'
//               ? 'bg-green-50 text-green-800 border border-green-200'
//               : 'bg-red-50 text-red-800 border border-red-200'
//           }`}>
//             {message.type === 'success' ? (
//               <FiCheckCircle className="h-5 w-5 flex-shrink-0" />
//             ) : (
//               <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
//             )}
//             <span>{message.text}</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminInscriptionForm;
// components/AdminInscriptionForm.tsx
import { useState, useEffect } from 'react';
import { FaCheckCircle, FaSpinner, FaChevronDown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import EleveSearch from './EleveSearch';
import { concoursApi,inscrireAdmin } from '../../../services/api';
import type { EleveDetail, Concours } from '../../../services/api';

interface Props {
  onSuccess?: () => void;
}

export default function AdminInscriptionForm({ onSuccess }: Props) {
  const [eleve, setEleve] = useState<EleveDetail | null>(null);
  const [concours, setConcours] = useState<Concours | null>(null);
  const [concoursList, setConcoursList] = useState<Concours[]>([]);
  const [loadingConcours, setLoadingConcours] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Chargement des concours
  useEffect(() => {
    const fetchConcours = async () => {
      setLoadingConcours(true);
      try {
        const data = await concoursApi.liste(); // adapte ton API
        setConcoursList(data);
      } catch {
        toast.error('Erreur chargement concours');
      } finally {
        setLoadingConcours(false);
      }
    };
    fetchConcours();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eleve || !concours) {
      toast.error('Sélectionnez un élève et un concours');
      return;
    }
    setSubmitting(true);
    try {
      // Appel à l'API d'inscription
      await inscrireAdmin({ eleve_id: eleve.id, concours_id: concours.id })
      toast.success('Inscription réussie !');
      setEleve(null);
      setConcours(null);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <EleveSearch value={eleve} onChange={setEleve} />

      {/* Sélecteur concours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Concours</label>
        <div className="relative">
          <select
            value={concours?.id || ''}
            onChange={e => setConcours(concoursList.find(c => c.id === e.target.value) || null)}
            className="w-full px-4 py-2.5 border rounded-lg appearance-none cursor-pointer outline-none transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Choisir un concours...</option>
            {concoursList.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !eleve || !concours}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
      >
        {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
        {submitting ? 'Inscription...' : 'Inscrire'}
      </button>
    </form>
  );
}
