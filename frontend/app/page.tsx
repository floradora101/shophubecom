// Storefront home page.
import type { Metadata } from "next";
import { HomePageContent } from "./home-page-content";
import { getHomePageData } from "@/lib/data/home";

export const metadata: Metadata = {
  title: "ShopHub - Your Trusted Online Shopping Destination",
  description:
    "Discover amazing products at unbeatable prices. Quality you can trust, delivered to your door.",
};

export default async function HomePage() {
  // Fetch homepage data server-side
  const homeData = await getHomePageData();

  return <HomePageContent data={homeData} />;
}
