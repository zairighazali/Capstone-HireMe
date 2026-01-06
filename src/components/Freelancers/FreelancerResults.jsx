import FreelancerCard from "./FreelancerCard";

export default function FreelancerResults({ freelancers }) {
  if (!freelancers || freelancers.length === 0) {
    return null;
  }

  return (
    <section className="container mt-3 mb-3">
      <h4 className="mb-4 text-center">Search Results</h4>

      <div className="row g-3 justify-content-center">
        {freelancers.map((f) => (
          <div key={f.id} className="col-6 col-md-4 col-lg-3">
            <FreelancerCard freelancer={f} />
          </div>
        ))}
      </div>
    </section>
  );
}

// Note:
// this component renders a list of freelancer cards based on search results.
// if the `freelancers` prop is empty or undefined, nothing will be rendered.
// each freelancer is mapped into a responsive Bootstrap grid column.
// the `FreelancerCard` component is reused to keep the UI clean and consistent.
