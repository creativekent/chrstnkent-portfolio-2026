(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const glyphs = '0123456789#%&*+<>/';
  const states = [...document.querySelectorAll('.stat-box')].map(el => {
    const value = el.textContent.trim();
    el.dataset.statValue = value;
    el.style.minWidth = `${value.length * .8}em`;
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    visual.textContent = value;
    const readable = document.createElement('span');
    readable.className = 'stat-readable';
    readable.textContent = value;
    el.replaceChildren(visual, readable);
    let timer;
    const restore = () => { clearTimeout(timer); timer = null; visual.textContent = value; };
    const animate = () => {
      if (reduced.matches || timer) return;
      // Reserve enough space for the widest scramble without moving nearby text.
      let frame = 0;
      const step = () => {
        if (!el.isConnected || reduced.matches || document.hidden) { restore(); return; }
        frame++;
        visual.textContent = [...value].map((char, i) =>
          frame >= 6 + i * 3 ? char : glyphs[Math.floor(Math.random() * glyphs.length)]
        ).join('');
        if (frame >= 6 + (value.length - 1) * 3) restore();
        else timer = setTimeout(step, 45);
      };
      step();
    };
    el.closest('.stat').addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') animate(); });
    return {el, animate, restore};
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          states.find(state => state.el === entry.target)?.animate();
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: .6});
    states.forEach(state => observer.observe(state.el));
  }
  reduced.addEventListener('change', () => { if (reduced.matches) states.forEach(state => state.restore()); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) states.forEach(state => state.restore()); });
})();
