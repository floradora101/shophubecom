// Storefront home page.
import type { Metadata } from "next";
import { HomePageContent } from "./home-page-content";

export const metadata: Metadata = {
  title: "ShopHub - Your Trusted Online Shopping Destination",
  description:
    "Discover amazing products at unbeatable prices. Quality you can trust, delivered to your door.",
};

export default function HomePage() {
  return <HomePageContent />;
}
