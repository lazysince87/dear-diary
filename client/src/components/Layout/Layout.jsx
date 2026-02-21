import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="bg-decoration bg-decoration-1" />
      <div className="bg-decoration bg-decoration-2" />
      <div className="bg-decoration bg-decoration-3" />

      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6 md:py-10 relative z-10">
        {children}
      </main>
      <footer className="text-center py-6 text-text-muted text-sm"></footer>
    </div>
  );
}
