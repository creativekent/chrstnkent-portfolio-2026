// Progressive motion: content remains visible if scripts or APIs are unavailable.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  function configure() {
    observer?.disconnect();
    document.querySelectorAll('.reveal-pending').forEach(el => el.classList.remove('reveal-pending'));
    if (preference.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) => {
        if (isIntersecting) {
          target.classList.remove('reveal-pending');
          observer.unobserve(target);
        }
      });
    }, {rootMargin: '0px 0px 40px 0px', threshold: 0.05});
    document.querySelectorAll('.work-heading, .testimonial, .bottom-cta, .journey-card, .collab, .personal-video-card').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add('reveal-item', 'reveal-pending');
        observer.observe(el);
      }
    });
  }
  configure();
  preference.addEventListener('change', configure);
})();
