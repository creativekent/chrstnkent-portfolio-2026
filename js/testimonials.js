(() => {
  const section = document.querySelector('.testimonials');
  const stage = section?.querySelector('.testimonials-container');
  if (!stage) return;
  const quotes = [...stage.querySelectorAll('.testimonial')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, timer, visible = false, interacting = false;
  const controls = document.createElement('div');
  controls.className = 'quote-controls';
  const dots = quotes.map((quote, i) => {
    const mark = document.createElement('span');
    mark.className = 'quote-mark'; mark.textContent = '“'; mark.setAttribute('aria-hidden', 'true');
    quote.prepend(mark);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'quote-dot';
    button.setAttribute('aria-label', `Show testimonial from ${quote.querySelector('.testimonial-author').textContent.trim()}`);
    button.addEventListener('click', () => { show(i); schedule(); });
    controls.append(button); return button;
  });
  stage.after(controls);
  stage.classList.add('quote-stage');
  function show(i) {
    index = i;
    quotes.forEach((quote, n) => {
      quote.classList.toggle('quote-active', n === i);
      quote.setAttribute('aria-hidden', String(n !== i));
      dots[n].setAttribute('aria-pressed', String(n === i));
    });
  }
  function schedule() {
    clearTimeout(timer);
    if (visible && !interacting && !reduced.matches && !document.hidden)
      timer = setTimeout(() => { show((index + 1) % quotes.length); schedule(); }, 30000);
  }
  section.addEventListener('mouseenter', () => { interacting = true; schedule(); });
  section.addEventListener('mouseleave', () => { interacting = section.contains(document.activeElement); schedule(); });
  section.addEventListener('focusin', () => { interacting = true; schedule(); });
  section.addEventListener('focusout', e => { interacting = section.contains(e.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', schedule);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(section);
  else visible = true;
  show(0); schedule();
})();
