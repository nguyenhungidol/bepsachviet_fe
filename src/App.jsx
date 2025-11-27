import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home/Home";
import "./App.css";
import News from "./pages/News/News";
import NewsDetail from "./pages/News/NewsDetail";
import Search from "./pages/Search/Search";
import ProductDetail from "./pages/Product/ProductDetail";
import Introduce from "./pages/Introduce/Introduce";
import Contact from "./pages/Contact/Contact";
import RecruitAgents from "./pages/RecruitAgents/RecruitAgents";
import Product from "./pages/Product/Product";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import TaiKhoan from "./pages/TaiKhoan/TaiKhoan";
import PublicLayout from "./layouts/PublicLayout";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import RequireAdmin from "./components/Auth/RequireAdmin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminPosts from "./pages/Admin/AdminPosts";
import AdminUsers from "./pages/Admin/AdminUsers";

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/tim-kiem" element={<Search />} />
              <Route path="/tin-tuc" element={<News />} />
              <Route path="/tin-tuc/:slug" element={<NewsDetail />} />
              <Route path="/gioi-thieu" element={<Introduce />} />
              <Route path="/lien-he" element={<Contact />} />
              <Route path="/tuyen-dai-ly" element={<RecruitAgents />} />
              <Route path="/san-pham" element={<Product />} />
              <Route path="/san-pham/:productId" element={<ProductDetail />} />
              <Route path="/dang-nhap" element={<Login />} />
              <Route path="/dang-ky" element={<Register />} />
              <Route path="/quen-mat-khau" element={<ForgotPassword />} />
              <Route path="/dat-lai-mat-khau" element={<ResetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
              <Route path="posts" element={<AdminPosts />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
