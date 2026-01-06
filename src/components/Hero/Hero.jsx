import HeroCarousel from "./HeroCarousel";
import SearchBar from "./HeroSearchPopup";
import { useState, useRef } from "react";
import { FreelancerResults } from "../Freelancers";
import './Hero.css'

export default function Hero() {
  const [results, setResults] = useState([]);

  const API_BASE_URL =
    "https://38598d96-2cae-4ccf-b576-296e506cfadb-00-138sqx8aobb0t.sisko.replit.dev";

  const handleSearch = async (query) => {
    if (!query) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users?search=${query}`);
      const data = await res.json();
      console.log("SEARCH RESULT:", data);
      setResults(data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  return (
    <>
      {/* HERO */}
      <section
        className={`hero-wrapper ${
          results.length > 0 ? "hero-shrink" : "hero-full"
        }`}
      >
        <div className="container text-center text-black">
          <h1 className="fw-bold display-5">
            Hire <span className="text-primary">top freelancers</span> in
            minutes
          </h1>

          <p className="fs-5 mb-4 opacity-75">
            Search, hire, and work with skilled professionals.
          </p>

          <SearchBar onSearch={handleSearch} />

          <p className="small mt-3 opacity-50">
            Example searches: Web Developer, Graphic Designer, Musician
          </p>
        </div>
      </section>
      <FreelancerResults freelancers={results} />
    </>
  );
}

// Note:
// this Hero component handles the main landing section and freelancer search.
// it manages search results using local state and fetches data from the backend API.
// when search results exist, the hero section shrinks to make room for the results below.
// the SearchBar component triggers `handleSearch`, which updates the results.
// freelancerResults is reused to display the list of matching freelancers.
