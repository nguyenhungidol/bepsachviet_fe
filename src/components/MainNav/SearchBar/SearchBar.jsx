import React, { useState } from "react";
import "./SearchBar.css";

const mockSuggestions = [
  "Vịt quay Bắc Kinh",
  "Cá hồi Nauy",
  "Gà ta thả vườn",
  "Hải sản đông lạnh",
  "Rượu nếp cái",
  "Hạt điều rang",
  "Heo rừng",
];

function SearchBar() {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [show, setShow] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setFiltered([]);
      setShow(false);
      return;
    }

    const results = mockSuggestions.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );

    setFiltered(results);
    setShow(true);
  };

  const handleSelect = (text) => {
    setQuery(text);
    setShow(false);
  };

  return (
    <div className="search-wrapper">
      <div className="search-box">
        <input
          className="search-input"
          placeholder="Tìm kiếm..."
          value={query}
          onChange={handleChange}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          onFocus={() => query.length > 0 && setShow(true)}
        />

        <button className="search-btn">
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
      </div>

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
