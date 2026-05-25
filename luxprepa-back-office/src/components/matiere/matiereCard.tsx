// components/matiere/MatiereCard.tsx
import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { type Matiere } from '../../services/api';

interface MatiereCardProps {
    matiere: Matiere;
    onEdit: (m: Matiere) => void;
    onDelete: (m: Matiere) => void;
}

const MatiereCard: React.FC<MatiereCardProps> = ({ matiere, onEdit, onDelete }) => {
    return (
        <div className="card bg-base-100 shadow-md p-4 border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">{matiere.nom}</h3>
                    {matiere.description && <p className="text-sm text-gray-600 mt-1">{matiere.description}</p>}
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-sm btn-ghost" onClick={() => onEdit(matiere)}>
                        <FiEdit2 />
                    </button>
                    <button className="btn btn-sm btn-ghost text-red-500" onClick={() => onDelete(matiere)}>
                        <FiTrash2 />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatiereCard;
