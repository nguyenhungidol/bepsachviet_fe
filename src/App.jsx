import TopBar from "./components/TopBar/TopBar";
import Header from "./components/Header/Header";
import MainNav from "./components/MainNav/MainNav";
import Home from "./components/Home/Home";
import FloatingButtons from "./components/FloatingButtons/FloatingButtons";
import "./App.css";

function App() {
  return (
    <div className="App">
      <TopBar />
      <Header />
      <MainNav />
      <Home />
      <FloatingButtons />
    </div>
  );
}

export default App;
