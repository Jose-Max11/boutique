// components/SearchHistory.jsx
import { useSearch } from "../context/SearchContext";

export default function SearchHistory() {
  const { history, updateSearch } = useSearch();

  if (!history.length) return null; // nothing to show

  return (
    <div className="search-history container my-3">
      <h6 className="fw-bold">Recent Searches:</h6>
      <div className="d-flex flex-wrap gap-2">
        {history.map((item, i) => (
          <button
            key={i}
            className="badge bg-light text-dark border"
            onClick={() => updateSearch(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
