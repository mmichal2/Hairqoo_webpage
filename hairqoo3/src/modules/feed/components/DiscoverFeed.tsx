"use client";

import { useEffect, useRef } from "react";
import type { Entity } from "@/core/entities/entity";
import { useFeedStore } from "@/core/state/feedStore";
import { useDict } from "@/core/state/i18nStore";
import { FeedItem } from "@/ui/cards/FeedItem";
import styles from "./DiscoverFeed.module.css";

export function DiscoverFeed({ seed }: { seed?: Entity[] }) {
  const dict = useDict();
  const { items, loading, hasMore, loadInitial, loadMore } = useFeedStore();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitial(seed);
  }, [loadInitial, seed]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <div className={styles.feed}>
      {items.map((entity) => (
        <FeedItem key={entity.id} entity={entity} />
      ))}

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

      {loading && <p className={styles.state}>{dict.common.loading}</p>}
      {!hasMore && items.length > 0 && (
        <p className={styles.state}>{dict.feed.end}</p>
      )}
    </div>
  );
}
