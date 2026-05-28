
import { createContext, useContext} from 'react';

interface User {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: 'eleve' | 'prof' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, token: null });

export const useAuth = () => useContext(AuthContext);
