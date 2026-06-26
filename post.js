const STORAGE_KEY = "personal-blog-dashboard-v2";

const starterData = {
  profile: {
    name: "Lyla Macklin",
  },
  posts: [],
};

const postArticle = document.querySelector("#postArticle");

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

function cleanFontFamily(value) {
  const font = (value || "").toLowerCase();
  if (font.includes("avenir")) return "'Avenir Next', Avenir, sans-serif";
  if (font.includes("helvetica")) return "'Helvetica Neue', Helvetica, Arial, sans-serif";
  if (font.includes("source serif")) return "'Source Serif 4', Georgia, serif";
  if (font.includes("georgia")) return "Georgia, serif";
  if (font.includes("arial")) return "Arial, sans-serif";
  return "";
}

function sanitizeRichText(value) {
  const template = document.createElement("template");
  template.innerHTML = value || "";
  const allowedTags = new Set(["B", "BR", "DIV", "EM", "FONT", "I", "P", "SPAN", "STRONG", "U"]);

  function clean(node) {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) return;
      if (child.nodeType !== Node.ELEMENT_NODE || !allowedTags.has(child.tagName)) {
        child.replaceWith(document.createTextNode(child.textContent || ""));
        return;
      }

      const color = child.getAttribute("color") || child.style.color;
      const face = child.getAttribute("face") || child.style.fontFamily;
      [...child.attributes].forEach((attribute) => child.removeAttribute(attribute.name));
      if (color && /^(#[0-9a-f]{3,8}|rgb\(|rgba\(|[a-z]+$)/i.test(color.trim())) {
        child.style.color = color.trim();
      }
      const fontFamily = cleanFontFamily(face);
      if (fontFamily) {
        child.style.fontFamily = fontFamily;
      }
      if (child.tagName === "FONT") {
        const span = document.createElement("span");
        span.innerHTML = child.innerHTML;
        if (child.style.color) span.style.color = child.style.color;
        if (child.style.fontFamily) span.style.fontFamily = child.style.fontFamily;
        child.replaceWith(span);
        clean(span);
        return;
      }
      clean(child);
    });
  }

  clean(template.content);
  return template.innerHTML;
}

function htmlToPlainText(value) {
  const element = document.createElement("div");
  element.innerHTML = sanitizeRichText(value || "");
  return element.textContent.trim();
}

function readTime(body) {
  const words = htmlToPlainText(body).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function renderPost() {
  const id = new URLSearchParams(window.location.search).get("id");
  const state = loadState();
  const post = (state.posts || []).find((entry) => entry.published && postKey(entry) === id);

  if (!post) {
    postArticle.innerHTML = `
      <p class="section-kicker">Missing post</p>
      <h1>Post not found</h1>
      <p>This post may be unpublished or deleted.</p>
    `;
    return;
  }

  document.title = `${post.title} | Lyla Macklin`;
  postArticle.innerHTML = `
    <p class="section-kicker"></p>
    <h1></h1>
    <p class="post-read-time"></p>
    <div class="post-body"></div>
  `;
  postArticle.querySelector(".section-kicker").textContent = post.category;
  postArticle.querySelector("h1").textContent = post.title;
  postArticle.querySelector(".post-read-time").textContent = `${formatDate(post.createdAt)} | ${readTime(post.body)}`;
  postArticle.querySelector(".post-body").innerHTML = sanitizeRichText(post.body);
}

renderPost();
