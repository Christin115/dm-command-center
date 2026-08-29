import { useState } from "react";

import { apiFetch } from "../api";

function DndResourceSearch({ resource, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    try {
      const data = await apiFetch(
        `/dnd/${resource}?name=${encodeURIComponent(query)}`
      );

      setResults(data.results || []);
      setError("");
    } catch (searchError) {
      setError(searchError.message);
    }
  }

  async function handleSelect(index) {
    try {
      const detail = await apiFetch(`/dnd/${resource}/${index}`);

      setError("");
      onSelect(detail);
    } catch (selectError) {
      setError(selectError.message);
    }
  }

  return (
    <div className="dnd-search">
      <form onSubmit={handleSearch}>
        <label>Search {resource}</label>

        <input
          value={query}
          placeholder="Search by name..."
          onChange={(event) => setQuery(event.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {results.length > 0 && (
        <ul className="dnd-search-results">
          {results.map((result) => (
            <li key={result.index}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => handleSelect(result.index)}
              >
                {result.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DndResourceSearch;
