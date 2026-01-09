import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ProfileSkeleton } from "@/lib/ui/loading";

export default function ProfileLoading() {
  return (
    <Container>
      <Section>
        <div className="max-w-4xl mx-auto">
          <ProfileSkeleton />
        </div>
      </Section>
    </Container>
  );
}
