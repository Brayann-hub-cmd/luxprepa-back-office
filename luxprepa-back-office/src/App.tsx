import ProtectedRoute from "./components/auth/Protectedroute ";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Login from "./components/auth/login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        

        {/* Route protégée */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App