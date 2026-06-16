"use client";

import { getAllEntities } from "@/core/data/queries";
import { useDict } from "@/core/state/i18nStore";
import { Container } from "@/ui/primitives/Container";
import { Grid } from "@/ui/primitives/Grid";
import { EntityCard } from "@/ui/cards/EntityCard";

export function ProfileView({ id }: { id: string }) {
  const dict = useDict();
  const owned = getAllEntities().filter((e) => e.ownerId === id);

  return (
    <Container>
      <header style={{ paddingBlock: "var(--space-xl) var(--space-md)" }}>
        <p
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--outline)",
            fontSize: "0.8rem",
            margin: 0,
          }}
        >
          {dict.profile.label}
        </p>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}>{id}</h1>
        <p style={{ color: "var(--muted)" }}>
          {owned.length} {dict.profile.itemsInEcosystem}
        </p>
      </header>
      <div style={{ paddingBottom: "var(--space-xl)" }}>
        <Grid min={260}>
          {owned.map((e) => (
            <EntityCard key={e.id} entity={e} />
          ))}
        </Grid>
      </div>
    </Container>
  );
}
