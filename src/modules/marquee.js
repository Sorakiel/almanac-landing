const MODULES = [
  'Привычки',
  'Тренировки',
  'Инсайты',
  'Рефлексия',
  'Финансы (скоро)',
  'Чтение (скоро)',
  'Сон (скоро)',
];

/** Builds the looping module ticker. Content is duplicated once so the CSS marquee loop is seamless. */
export function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  const frag = document.createDocumentFragment();

  for (let rep = 0; rep < 2; rep++) {
    MODULES.forEach((name) => {
      const span = document.createElement('span');
      span.innerHTML = `<b>◇</b>${name}`;
      frag.appendChild(span);
    });
  }
  track.appendChild(frag);
}
