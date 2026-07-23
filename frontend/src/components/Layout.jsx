import Navbar from './SideNav';
import Footer from './Footer';

export default function Layout({ children, videoPage = false }) {
  if (videoPage) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-background text-on-background">
        <div className="shrink-0">
          <Navbar />
        </div>

        <main className="min-h-0 w-full flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background">
      <Navbar />

      <main className="w-full flex-1 px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}