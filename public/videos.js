"use strict";

const videoList = document.querySelector("#videos-list");
const videoStatus = document.querySelector("#videos-status");
const videoControls = document.querySelector("#videos-controls");
const previousVideo = document.querySelector("#videos-prev");
const nextVideo = document.querySelector("#videos-next");
const atomNamespace = "http://www.w3.org/2005/Atom";
const youtubeNamespace = "http://www.youtube.com/xml/schemas/2015";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function readVideos(xml) {
  const feed = new DOMParser().parseFromString(xml, "application/xml");
  const entries = feed.getElementsByTagNameNS(atomNamespace, "entry");

  return Array.from(entries, (entry) => ({
    id: entry.getElementsByTagNameNS(youtubeNamespace, "videoId")[0]?.textContent.trim(),
    title: entry.getElementsByTagNameNS(atomNamespace, "title")[0]?.textContent.trim(),
    published: Date.parse(entry.getElementsByTagNameNS(atomNamespace, "published")[0]?.textContent),
  }))
    .filter(({ id, title, published }) => /^[A-Za-z0-9_-]{11}$/.test(id ?? "") && title && Number.isFinite(published))
    .sort((a, b) => b.published - a.published)
    .slice(0, 6);
}

function makeVideoCard({ id, title }) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.className = "video-card";
  link.href = "https://www.youtube.com/watch?v=" + id;

  const image = document.createElement("img");
  image.src = "https://i.ytimg.com/vi/" + id + "/mqdefault.jpg";
  image.width = 320;
  image.height = 180;
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";

  const heading = document.createElement("h3");
  heading.textContent = title;

  link.append(image, heading);
  item.append(link);
  return item;
}

function updateVideoControls() {
  const maxScroll = videoList.scrollWidth - videoList.clientWidth;
  videoControls.hidden = maxScroll <= 1;
  previousVideo.disabled = videoList.scrollLeft <= 1;
  nextVideo.disabled = videoList.scrollLeft >= maxScroll - 1;
}

function scrollVideos(direction) {
  const [first, second] = videoList.children;
  if (!second) return;
  const step = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
  videoList.scrollBy({ left: step * direction, behavior: reducedMotion.matches ? "instant" : "smooth" });
}

async function loadVideos() {
  videoStatus.textContent = "Carregando vídeos…";
  videoStatus.hidden = false;
  try {
    const response = await fetch("./youtube-feed.xml", { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Feed indisponível");

    const videos = readVideos(await response.text());
    if (!videos.length) throw new Error("Feed sem vídeos");

    videoList.replaceChildren(...videos.map(makeVideoCard));
    videoList.hidden = false;
    videoStatus.hidden = true;
    updateVideoControls();
    const observer = new ResizeObserver(updateVideoControls);
    observer.observe(videoList);
  } catch {
    videoStatus.textContent = "Os vídeos estão indisponíveis no momento. Veja os últimos envios no canal.";
  }
}

previousVideo.addEventListener("click", () => scrollVideos(-1));
nextVideo.addEventListener("click", () => scrollVideos(1));
videoList.addEventListener("scroll", updateVideoControls, { passive: true });
loadVideos();
