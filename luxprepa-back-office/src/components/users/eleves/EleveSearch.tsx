// components/EleveSearch.tsx
import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import { eleveApi, type EleveDetail } from '../../../services/api';

interface Props {
  value: EleveDetail | null;
  onChange: (eleve: EleveDetail | null) => void;
}

export default function EleveSearch({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [eleves, setEleves] = useState<EleveDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Chargement de la liste au montage
  useEffect(() => {
    const fetchEleves = async () => {
      setLoading(true);
      try {
        const data = await eleveApi.liste();
        setEleves(data);
      } catch (err) {
        console.error('Erreur chargement élèves', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEleves();
  }, []);

  // Filtre local
  const filtered = query.trim()
    ? eleves.filter(e =>
        `${e.prenom} ${e.nom}`.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Élève</label>
      <div className={`relative flex items-center border rounded-lg transition-all ${
        open ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-gray-400'
      }`}>
        <FaSearch className="absolute left-3 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher un élève..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="w-full pl-10 pr-10 py-2.5 bg-transparent outline-none text-sm"
        />
        {/* Icône de chargement ou de suppression */}
        {loading ? (
          <FaSpinner className="absolute right-3 animate-spin text-indigo-500" />
        ) : value && query ? (
          <button onClick={() => { onChange(null); setQuery(''); }} className="absolute right-2 p-1 rounded-full hover:bg-gray-100">
            <FaTimes className="text-gray-500" />
          </button>
        ) : null}
      </div>

      {/* Résultats filtrés */}
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
          {filtered.map(eleve => (
            <li
              key={eleve.id}
              onMouseDown={() => {
                onChange(eleve);
                setQuery(`${eleve.prenom} ${eleve.nom}`);
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                {eleve.prenom[0]}{eleve.nom[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{eleve.prenom} {eleve.nom}</p>
                <p className="text-xs text-gray-500">{eleve.telephone}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && filtered.length === 0 && !loading && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500 text-sm">
          Aucun élève trouvé
        </div>
      )}
    </div>
  );
}
