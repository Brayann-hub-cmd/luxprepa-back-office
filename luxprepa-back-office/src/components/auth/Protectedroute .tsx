import { Navigate } from "react-router-dom"
import { tokenUtils } from "../../services/api"

interface ProtectedRouteProps {
  children: React.ReactNode
  rolesAutorises?: ("admin" | "prof")[]
}

const ProtectedRoute = ({
  children,
  rolesAutorises = ["admin", "prof"]
}: ProtectedRouteProps) => {
  const user = tokenUtils.getUser()
  const token = tokenUtils.recuperer()

  // Pas connecté → login
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  // Rôle non autorisé → login
  if (!rolesAutorises.includes(user.role as "admin" | "prof")) {
    tokenUtils.supprimer()
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute