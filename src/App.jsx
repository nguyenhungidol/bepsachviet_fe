import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar/TopBar";
import Header from "./components/Header/Header";
import MainNav from "./components/MainNav/MainNav";
import Home from "./components/pages/Home/Home";
import Footer from "./components/Footer/Footer";
import FloatingButtons from "./components/FloatingButtons/FloatingButtons";

import "./App.css";
import News from "./components/pages/news/News";
import Introduce from "./components/pages/Introduce/Introduce";
import Contact from "./components/pages/Contact/Contact";
import RecruitAgents from "./components/pages/RecruitAgents/RecruitAgents";
import Product from "./components/pages/Product/Product";

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
        </Routes>

        <Footer />
        <FloatingButtons />
      </div>
    </Router>
  );
}

export default App;
