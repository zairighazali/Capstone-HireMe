import { useState } from "react";

export default function HeroSearchPopup({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="d-flex justify-content-center gap-2"
    >
      <input
        className="form-control form-control-lg w-50"
        placeholder="Search freelancers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="btn btn-primary btn-lg">
        Search
      </button>
    </form>
  );
}

// Note:
// this component renders a simple search form for freelancers.
// it keeps the search keyword in local state as a controlled input.
// when the form is submitted, `e.preventDefault()` is used to stop the browser from refreshing the page.
// and calls `onSearch` with the current query value.
// the actual search logic is handled by the parent component.
