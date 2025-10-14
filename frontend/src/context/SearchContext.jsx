// context/SearchContext.jsx
import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState([]);

  const updateSearch = (value) => {
    setSearchTerm(value);

    // Add to history (avoid duplicates, max 10 items)
    setHistory((prev) => {
      const newHistory = prev.filter((h) => h !== value);
      return [value, ...newHistory].slice(0, 10);
    });
  };

  return (
    <SearchContext.Provider value={{ searchTerm, updateSearch, history }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
