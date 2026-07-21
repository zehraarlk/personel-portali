import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}
