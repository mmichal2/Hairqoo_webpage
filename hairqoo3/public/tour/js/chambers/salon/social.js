export function initSocial(root) {
  const post = root.querySelector("[data-chamber-id='social'] .mock-ig-post");
  post?.addEventListener("click", () => {
    post.style.transform = "scale(1.02)";
    setTimeout(() => { post.style.transform = ""; }, 300);
  });
}
