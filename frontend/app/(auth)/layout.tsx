// Layout wrapper for auth routes sharing page shell.
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                <span className="text-white font-bold text-xl">S</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">
              <span className="text-primary-500">SHOP</span>
              <span className="text-gray-800">HUB</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Your trusted online shopping destination
            </p>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-10">
          {children}
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          By continuing, you agree to ShopHub&apos;s{" "}
          <Link
            href="/terms"
            className="text-primary-500 hover:text-primary-600 underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-primary-500 hover:text-primary-600 underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
