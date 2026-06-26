const STORAGE_KEY = "personal-blog-dashboard-v2";

const starterData = {
  profile: {
    name: "Lyla Macklin",
  },
  posts: [],
};

const publicName = document.querySelector("#publicName");
const publicPosts = document.querySelector("#publicPosts");

function loadState() {
  if (window.PUBLIC_BLOG_DATA?.posts?.length) return window.PUBLIC_BLOG_DATA;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return starterData;

  try {
    return { ...starterData, ...JSON.parse(saved) };
  } catch {
    return starterData;
  }
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function postKey(post) {
  return post.id || `${post.title}-${post.createdAt}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function htmlToPlainText(value) {
  const element = document.createElement("div");
  element.innerHTML = value || "";
  return element.textContent.trim();
}

function readTime(body) {
  const words = htmlToPlainText(body).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function renderPublicView() {
  const state = loadState();
  const name = state.profile?.name === "Lyla" ? "Lyla Macklin" : state.profile?.name || "Lyla Macklin";
  const posts = [...(state.posts || [])]
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  publicName.textContent = name;
  document.title = `${name} | Personal Blog`;
  publicPosts.innerHTML = "";

  if (!posts.length) {
    publicPosts.innerHTML = '<p class="empty-state">No public posts yet.</p>';
    return;
  }

  posts.forEach((post) => {
    const link = document.createElement("a");
    link.className = "reader-post";
    link.href = `./post.html?id=${encodeURIComponent(postKey(post))}`;
    link.innerHTML = `
      <span class="meta"></span>
      <span class="reader-title"></span>
      <span class="reader-details"></span>
    `;
    link.querySelector(".meta").textContent = post.category;
    link.querySelector(".reader-title").textContent = post.title;
    link.querySelector(".reader-details").textContent = `${formatDate(post.createdAt)} | ${readTime(post.body)}`;
    publicPosts.append(link);
  });
}

renderPublicView();
