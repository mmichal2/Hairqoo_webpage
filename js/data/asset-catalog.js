/** Tematyczne assety encji — 1:1 z hairqoo3/src/core/data/asset-catalog.ts */
export const HAIRQOO_ASSETS = {
  hero: "./assets/images/sections/hero-home.jpg",
  events: [
    "./assets/images/events/event-1.jpg",
    "./assets/images/events/event-2.jpg",
    "./assets/images/events/event-3.jpg",
    "./assets/images/events/event-4.jpg",
  ],
  educators: [
    "./assets/images/educators/educator-1.jpg",
    "./assets/images/educators/educator-2.jpg",
    "./assets/images/educators/educator-3.jpg",
  ],
  products: [
    "./assets/images/products/product-1.jpg",
    "./assets/images/products/product-2.jpg",
    "./assets/images/products/product-3.jpg",
  ],
  academies: ["./assets/images/academies/academy-1.jpg"],
  salons: ["./assets/images/salons/salon-1.jpg"],
  brands: ["./assets/images/brands/brand-1.jpg"],
  posts: [
    "./assets/images/posts/post-1.jpg",
    "./assets/images/posts/post-2.jpg",
  ],
  videoPosters: [
    "./assets/images/videos/video-1-poster.jpg",
    "./assets/images/videos/video-2-poster.jpg",
    "./assets/images/videos/video-3-poster.jpg",
  ],
};

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function pickOne(list, id) {
  return list[hashId(id) % list.length];
}

/** Okładki encji z realistycznych, tematycznych assetów. */
export function entityMedia(type, id, title) {
  switch (type) {
    case "brand":
      return {
        type: "image",
        url: pickOne(HAIRQOO_ASSETS.brands, id),
        alt: title,
        focalPoint: "50% 50%",
      };
    case "academy":
      return {
        type: "image",
        url: pickOne(HAIRQOO_ASSETS.academies, id),
        alt: title,
        focalPoint: "50% 50%",
      };
    case "salon":
      return {
        type: "image",
        url: pickOne(HAIRQOO_ASSETS.salons, id),
        alt: title,
        focalPoint: "50% 50%",
      };
    case "product":
      return {
        type: "image",
        url: pickOne(HAIRQOO_ASSETS.products, id),
        alt: title,
        focalPoint: "50% 50%",
      };
    case "event":
      return {
        type: "image",
        url: pickOne(HAIRQOO_ASSETS.events, id),
        alt: title,
        focalPoint: "50% 40%",
      };
    case "educator":
      return {
        type: "image",
        url: pickOne(HAIRQOO_ASSETS.educators, id),
        alt: title,
        focalPoint: "50% 35%",
      };
    case "post":
      return {
        type: "image",
        url: pickOne(HAIRQOO_ASSETS.posts, id),
        alt: title,
        focalPoint: "50% 50%",
      };
    case "video":
      return {
        type: "image",
        url: pickOne(HAIRQOO_ASSETS.videoPosters, id),
        alt: title,
        focalPoint: "50% 50%",
      };
    default:
      return {
        type: "image",
        url: HAIRQOO_ASSETS.hero,
        alt: title,
        focalPoint: "50% 50%",
      };
  }
}
