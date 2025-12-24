import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col relative">
      {/* Background Gradients - Same as Homepage */}
      <div className="fixed inset-0 bg-linear-to-br from-primary-50 via-cream-50 to-primary-100/50 opacity-60 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.08),transparent_50%)] -z-10" />

      <Header />
      <main className="flex-1 relative z-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}

