// src/App.jsx
import Header from "./components/Header/Header";
import MainNav from "./components/MainNav/MainNav";
import Home from "./components/Home/Home";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Header />
      <MainNav />
      <Home />
      {/* Footer nếu có */}
    </div>
  );
}

export default App;
