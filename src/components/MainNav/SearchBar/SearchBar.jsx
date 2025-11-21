import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SearchBar.css";

const HISTORY_KEY = "bv_search_history";
const MAX_HISTORY = 6;

const loadHistory = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse search history", error);
    return [];
  }
};

function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState(loadHistory);
  const [filtered, setFiltered] = useState(() => loadHistory());
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const searchParam = params.get("search") || "";
    setQuery(searchParam);
    setShow(false);
  }, [location.search]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(history);
      return;
    }
    const results = history.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(results);
  }, [query, history]);

  const rememberSearch = useCallback((term) => {
    const normalized = term.trim();
    if (!normalized) return;

    setHistory((prev) => {
      const next = [
        normalized,
        ...prev.filter(
          (item) => item.toLowerCase() !== normalized.toLowerCase()
        ),
      ].slice(0, MAX_HISTORY);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setFiltered(history);
      setShow(history.length > 0);
      return;
    }

    const results = history.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );

    setFiltered(results);
    setShow(true);
  };

  const handleSearch = useCallback(
    (text) => {
      const normalized = text.trim();
      if (!normalized) return;

      rememberSearch(normalized);
      setQuery(normalized);
      setShow(false);
      navigate(`/san-pham?search=${encodeURIComponent(normalized)}`);
    },
    [navigate, rememberSearch]
  );

  const handleSelect = (text) => {
    handleSearch(text);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch(query);
  };

  const handleFocus = () => {
    if (query.trim()) {
      setShow(filtered.length > 0);
      return;
    }
    setFiltered(history);
    setShow(history.length > 0);
  };

  return (
    <div className="search-wrapper">
      <form className="search-box" onSubmit={handleSubmit}>
        <input
          className="search-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={handleChange}
          onBlur={() => setTimeout(() => setShow(false), 150)}
          onFocus={handleFocus}
        />

        <button type="submit" className="search-btn" aria-label="Tìm kiếm">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21L16.65 16.65" />
          </svg>
        </button>
      </form>

      {show && filtered.length > 0 && (
        <ul className="suggestions">
          {filtered.map((item, index) => (
            <li key={index} onMouseDown={() => handleSelect(item)}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
