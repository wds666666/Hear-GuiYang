// 数据层里的资源路径都以 / 开头，部署在 GitHub Pages 子路径下需要补上 base。
export function asset(path) {
  if (!path) return '';
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
