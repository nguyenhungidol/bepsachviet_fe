import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar/TopBar";
import Header from "./components/Header/Header";
import MainNav from "./components/MainNav/MainNav";
import Footer from "./components/Footer/Footer";
import FloatingButtons from "./components/FloatingButtons/FloatingButtons";
import Home from "./pages/Home/Home";

import "./App.css";
import News from "./pages/news/News";
import Introduce from "./pages/Introduce/Introduce";
import Contact from "./pages/Contact/Contact";
import RecruitAgents from "./pages/RecruitAgents/RecruitAgents";
import Product from "./pages/Product/Product";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import TaiKhoan from "./pages/TaiKhoan/TaiKhoan";

function App() {
  return (
    <Router>
      <div className="App">
        <TopBar />
        <Header />
        <MainNav />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tin-tuc" element={<News />} />
          <Route path="/gioi-thieu" element={<Introduce />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/tuyen-dai-ly" element={<RecruitAgents />} />
          <Route path="/san-pham" element={<Product />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/tai-khoan" element={<TaiKhoan />} />
        </Routes>

        <FloatingButtons />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
