// Storefront home page.
import type { Metadata } from "next";
import { HomePageContent } from "./home-page-content";
import { getHomePageData } from "@/lib/data/home";

export const metadata: Metadata = {
  title: "Your Trusted Online Shopping Destination",
  description:
    "Discover amazing products at unbeatable prices. Quality you can trust, delivered to your door.",
};

// Always fetch fresh data so departments/categories from API are up to date (no static cache)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  // Fetch homepage data server-side
  const homeData = await getHomePageData();

  return <HomePageContent data={homeData} />;
}
