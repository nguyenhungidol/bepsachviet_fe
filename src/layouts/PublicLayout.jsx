import { Outlet } from "react-router-dom";
import TopBar from "../components/TopBar/TopBar";
import Header from "../components/Header/Header";
import MainNav from "../components/MainNav/MainNav";
import Footer from "../components/Footer/Footer";
import FloatingButtons from "../components/FloatingButtons/FloatingButtons";
import FloatingChat from "../components/Chat/FloatingChat";

const PublicLayout = () => (
  <div className="App">
    <TopBar />
    <Header />
    <MainNav />
    <Outlet />
    <FloatingButtons />
    <FloatingChat />
    <Footer />
  </div>
);

export default PublicLayout;
