import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CustomNavbar from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminPanel from "./pages/AdminPanel";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Notifications from "./pages/Notifications";
import PaymentPage from "./pages/PaymentPage";
import ProductDetails from "./pages/ProductDetails"; // ✅ Import ProductDetails
import RegisterPage from "./pages/RegisterPage";
import UploadProductForm from "./pages/UploadProductForm";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <AuthProvider>
      <Router>
        <CustomNavbar />
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* ✅ Updated Route for ProductDetails */}
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute>
                <ProductDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-product"
            element={
              <ProtectedRoute>
                <UploadProductForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
