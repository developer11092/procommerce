// Imagery, featured videos, and small media helpers used across the site.

// Homepage walkthrough (Google Drive). Swap for a direct .mp4 to play natively.
export const WALKTHROUGH_VIDEO = "https://drive.google.com/file/d/1kegDTr4diB9uHWjkR38ZPG3M4ZswIQx8/preview";

// Free stock imagery (Unsplash). If a remote image fails to load it falls back
// to a bundled local photo, so nothing ever appears broken.
export const stock = {
  about:      { src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1280&q=70", fb: "/hero_pos_scene.jpg" },
  about2:     { src: "https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=1280&q=70", fb: "/retail_path.jpg" },
  consult:    { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1280&q=70", fb: "/hero_pos_scene.jpg" },
  statement:  { src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1280&q=70", fb: "/cafe_path.jpg" },
  restaurant: { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1280&q=70", fb: "/restaurant_path.jpg" },
  retail:     { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1280&q=70", fb: "/retail_path.jpg" },
  hardware:   { src: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1280&q=70", fb: "/hero_pos_scene.jpg" },
  onboarding: { src: "/square-onboarding.jpg", fb: "/hero_pos_scene.jpg" },
  heroMain:   { src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1280&q=75", fb: "/hero_pos_scene.jpg" },
  nRestaurant:{ src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=70", fb: "/restaurant_path.jpg" },
  nCafe:      { src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=70", fb: "/cafe_path.jpg" },
  nRetail:    { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=70", fb: "/retail_path.jpg" },
  showcase:   { src: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1280&q=75", fb: "/hero_pos_scene.jpg" }
};

// onError handler factory: swap to a bundled fallback if a remote image 404s.
export const onImgError = (fb) => (e) => { e.currentTarget.onerror = null; e.currentTarget.src = fb; };

// Featured Square videos on the Plans page — official Square clips that play
// inline directly on the page (autoplay-on-scroll, muted).
export const plansVideos = [
  {
    kicker: "Square in Action",
    heading: "See how Square powers a busy counter",
    body: "Watch how payments, orders, and reporting flow through one connected Square system — from the first tap to end-of-day totals.",
    src: "https://pw-assets-production-c.squarecdn.com/video/1y4rpdqDQl2cMHnIE9ydbA/3b6c428c-9441-461f-b367-0433676a800e-en-1445_Durability_H264_16x9_enUS.mp4",
    aspect: "16 / 9",
    title: "Square in Action"
  },
  {
    kicker: "Up & Running Fast",
    heading: "Get set up in minutes, not weeks",
    body: "From creating your profile to taking your first payment, see how quickly a Square setup comes together with hands-on guidance from Pro Commerce Solutions.",
    src: "https://videos.ctfassets.net/2d5q1td6cyxq/2U0pseFJrWAqn8Q54FM6N3/35ac3d622e0e4589f3e54455946755f9/PD07447_videobattery-bg-usen-9x16-compressed.mp4",
    aspect: "9 / 16",
    title: "Getting Set Up with Square"
  }
];
