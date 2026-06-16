import { getFeedPage } from "@/core/data/queries";
import { HomeHero } from "@/app-shell/HomeHero";
import { Container } from "@/ui/primitives/Container";
import { AIAssistantPanel } from "@/modules/ai-assistant/components/AIAssistantPanel";
import { PortalsSection } from "@/modules/portals";
import { DiscoverFeed } from "@/modules/feed/components/DiscoverFeed";
import { TrendingPanel } from "@/modules/feed/components/TrendingPanel";
import { EventsPreview } from "@/modules/events";
import { LazyCalendar, LazyWorldMap } from "@/app-shell/LazySections";
import { EducationHubPreview } from "@/modules/education";
import { TopEducatorsList } from "@/modules/educators";
import { ProductFeedPreview } from "@/modules/products";
import { CommunityFeedPreview } from "@/modules/community";
import { CareerJobsPreview } from "@/modules/career";
import { VideoHubPreview } from "@/modules/tv";
import { AwardsPreview } from "@/modules/awards";
import { PassportPreview } from "@/modules/passport";
import { NewsletterSignup } from "@/modules/newsletter";
import { DiscoverHeading } from "@/app-shell/DiscoverHeading";

/**
 * HOMEPAGE = CONTROL CENTER.
 * Kolejność sekcji zgodna ze specyfikacją HAIRQOO 3.0.
 */
export default function HomePage() {
  const seed = getFeedPage(null).items;

  return (
    <>
      {/* 1. GLOBAL SEARCH ENGINE (HERO) */}
      <HomeHero />

      {/* 2. AI ASSISTANT PANEL */}
      <div className="section-pad">
        <Container>
          <AIAssistantPanel />
        </Container>
      </div>

      {/* Portale Hairqoo — Twój biznes / Twoje wizyty (zachowane z hairqoo.com) */}
      <PortalsSection />

      {/* 3. DISCOVER FEED (CORE) */}
      <div className="section-pad" id="discover">
        <DiscoverHeading />
        <DiscoverFeed seed={seed} />
      </div>

      {/* 4. TRENDING NOW */}
      <TrendingPanel />

      {/* 5. GLOBAL EVENTS CENTER */}
      <EventsPreview />

      {/* 6. GLOBAL HAIR CALENDAR (lazy) */}
      <LazyCalendar />

      {/* 7. HAIRQOO WORLD MAP (lazy) */}
      <LazyWorldMap />

      {/* 8. EDUCATION HUB */}
      <EducationHubPreview />

      {/* 9. EDUCATOR DATABASE */}
      <TopEducatorsList />

      {/* 10. PRODUCT DISCOVERY */}
      <ProductFeedPreview />

      {/* 11. COMMUNITY HUB */}
      <CommunityFeedPreview />

      {/* 12. CAREER CENTER */}
      <CareerJobsPreview />

      {/* 13. HAIRQOO TV */}
      <VideoHubPreview />

      {/* 14. HAIRQOO AWARDS */}
      <AwardsPreview />

      {/* 15. HAIRQOO PASSPORT */}
      <PassportPreview />

      {/* 16. NEWSLETTER */}
      <div className="section-pad">
        <Container>
          <NewsletterSignup />
        </Container>
      </div>
    </>
  );
}
