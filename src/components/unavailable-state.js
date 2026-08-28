export function unavailableState(title, message) {
  return `<section class="unavailable" role="status">
    <span class="unavailable__mark" aria-hidden="true">···</span>
    <div><h3>${title}</h3><p>${message}</p></div>
  </section>`;
}
