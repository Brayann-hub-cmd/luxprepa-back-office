import ProtectedRoute from "./components/auth/Protectedroute ";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ResultatsPublicSession from "./resultats";
import Login from "./components/auth/login";
import { Navigate } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/resultats-session/:sessionId" element={<ResultatsPublicSession />} />

        {/* Route protégée */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/admin" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App