import Navbar from "./SideNav";
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <Navbar />

      <main className="w-full flex-1 px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}