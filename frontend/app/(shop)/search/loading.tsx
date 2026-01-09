import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SearchResultsSkeleton } from "@/lib/ui/loading";

export default function SearchLoading() {
  return (
    <Container>
      <Section>
        <div className="max-w-6xl mx-auto">
          <SearchResultsSkeleton />
        </div>
      </Section>
    </Container>
  );
}
