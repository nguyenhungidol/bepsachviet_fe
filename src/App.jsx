import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";

import "./App.css";
import News from "./pages/News/News";
import Introduce from "./pages/Introduce/Introduce";
import Contact from "./pages/Contact/Contact";
import RecruitAgents from "./pages/RecruitAgents/RecruitAgents";
import Product from "./pages/Product/Product";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import TaiKhoan from "./pages/TaiKhoan/TaiKhoan";
import PublicLayout from "./layouts/PublicLayout";
import { AuthProvider } from "./context/AuthContext";
import RequireAdmin from "./components/Auth/RequireAdmin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminUsers from "./pages/Admin/AdminUsers";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tin-tuc" element={<News />} />
            <Route path="/gioi-thieu" element={<Introduce />} />
            <Route path="/lien-he" element={<Contact />} />
            <Route path="/tuyen-dai-ly" element={<RecruitAgents />} />
            <Route path="/san-pham" element={<Product />} />
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/dang-ky" element={<Register />} />
            <Route path="/tai-khoan" element={<TaiKhoan />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
