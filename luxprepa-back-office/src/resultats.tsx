import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface EleveResultat {
  nom: string;
  prenom: string;
  notes: Record<string, number | null>;
  total: number;
  rang: number;
}

interface ResultatsData {
  session: { id: string; nom: string };
  matieres: string[];
  eleves: EleveResultat[];
}

const ResultatsPublicSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<ResultatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResultats = async () => {
      try {
        const response = await fetch(`/api/resultats-public/${sessionId}/`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.erreur || 'Erreur de chargement');
        }
        const resultats: ResultatsData = await response.json();
        setData(resultats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResultats();
  }, [sessionId]);

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Erreur : {error}</div>;
  if (!data) return null;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Résultats - {data.session.nom}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Rang</th>
              <th className="px-4 py-2 border">Nom</th>
              <th className="px-4 py-2 border">Prénom</th>
              {data.matieres.map(m => (
                <th key={m} className="px-4 py-2 border">{m}</th>
              ))}
              <th className="px-4 py-2 border font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.eleves.map((eleve, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border text-center">{eleve.rang}</td>
                <td className="px-4 py-2 border">{eleve.nom}</td>
                <td className="px-4 py-2 border">{eleve.prenom}</td>
                {data.matieres.map(m => (
                  <td key={m} className="px-4 py-2 border text-center">
                    {eleve.notes[m] !== null ? eleve.notes[m] : '-'}
                  </td>
                ))}
                <td className="px-4 py-2 border text-center font-semibold">{eleve.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultatsPublicSession;
