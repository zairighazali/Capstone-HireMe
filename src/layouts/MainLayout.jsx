import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />

      {/* MAIN CONTENT */}
      <main className="flex-grow-1 pt-5">
        {children}
      </main>

      <Footer />
    </div>
  );
}

// Note:
// this component defines the main layout for the app pages.
// it includes the AppNavbar at the top and Footer at the bottom.
// the `children` prop is rendered in the middle as the main content area.
// using `d-flex flex-column min-vh-100` ensures the footer stays at the bottom
// even if the page content is short, while letting the main content grow as needed.
// basically, wrap any page inside MainLayout to get consistent header/footer layout.
