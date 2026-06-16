"use client";

import dynamic from "next/dynamic";
import { Container } from "@/ui/primitives/Container";
import { GlassPanel } from "@/ui/primitives/GlassPanel";

function Skeleton({ height }: { height: number }) {
  return (
    <Container>
      <GlassPanel
        style={{
          height,
          display: "grid",
          placeItems: "center",
          color: "var(--outline)",
          fontSize: "0.9rem",
        }}
      >
        Ładowanie…
      </GlassPanel>
    </Container>
  );
}

/** Leniwie ładowane, cięższe moduły (mapa, kalendarz) — code-split + brak SSR. */
export const LazyWorldMap = dynamic(
  () => import("@/modules/map").then((m) => m.WorldMapInteractive),
  { ssr: false, loading: () => <Skeleton height={360} /> }
);

export const LazyCalendar = dynamic(
  () => import("@/modules/calendar").then((m) => m.GlobalCalendarWidget),
  { ssr: false, loading: () => <Skeleton height={320} /> }
);
