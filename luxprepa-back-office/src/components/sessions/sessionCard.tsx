// components/session/SessionCard.tsx
import React from 'react';
import { FiCalendar, FiUsers, FiBarChart2, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { type Session, authApi, type User } from '../../services/api';

interface SessionCardProps {
    session: Session;
    onEdit: (s: Session) => void;
    onDelete: (s: Session) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onEdit, onDelete }) => {
    const user = authApi.getUserLocal() as User
    const isAdmin = user.role === 'admin' ? true : false
    return (
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-gray-100">
            <div className="card-body p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="card-title text-lg font-bold">{session.nom}</h3>
                        {session.concours_nom && (
                            <p className="text-sm text-gray-600 mt-1">
                                <FiBarChart2 className="inline mr-1" />
                                Concours : {session.concours_nom}
                            </p>
                        )}
                    </div>
                    {
                        isAdmin && <div className="flex gap-2">
                            <button className="btn btn-sm btn-ghost" onClick={() => onEdit(session)} title="Modifier">
                                <FiEdit2 />
                            </button>
                            <button className="btn btn-sm btn-ghost text-red-500" onClick={() => onDelete(session)} title="Supprimer">
                                <FiTrash2 />
                            </button>
                        </div>
                    }
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                    {session.date && (
                        <span className="flex items-center gap-1">
                            <FiCalendar /> {new Date(session.date).toLocaleDateString('fr-FR')}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <FiUsers /> {session.nombre_notes ?? 0} note(s)
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SessionCard;
