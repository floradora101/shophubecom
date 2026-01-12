// Layout wrapper for auth routes sharing page shell.
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col relative bg-warm-gray-50">
      <Header />

      <main className="flex-1 relative z-0 pb-24 md:pb-40">{children}</main>

      <Footer />
    </div>
  );
}
