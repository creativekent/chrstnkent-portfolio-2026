(() => {
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const ring = document.querySelector('.custom-cursor-ring');
  const dot = document.querySelector('.custom-cursor-dot');
  if (!ring || !dot) return;
  const buttons = [...document.querySelectorAll('.btn, button, .site-header .brand')];
  let frame = 0, x = -100, y = -100, rx = -100, ry = -100;
  const hide = () => { document.body.classList.remove('cursor-visible'); cancelAnimationFrame(frame); frame = 0; };
  const draw = () => {
    rx += (x - rx) * .18; ry += (y - ry) * .18;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
    if (Math.abs(x-rx) + Math.abs(y-ry) > .1) frame = requestAnimationFrame(draw);
    else frame = 0;
  };
  document.addEventListener('pointermove', e => {
    if (!enabled.matches || e.pointerType !== 'mouse') { hide(); return; }
    if (e.target.closest('a,button,input,textarea,select,iframe,[role="button"]')) { hide(); return; }
    x = e.clientX; y = e.clientY;
    if (!document.body.classList.contains('cursor-visible')) { rx=x; ry=y; }
    document.body.classList.add('cursor-visible');
    dot.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    if (!frame) frame = requestAnimationFrame(draw);
  });
  const reset = button => { button.style.translate = ''; button.classList.remove('magnetic-active'); };
  buttons.forEach(button => {
    button.classList.add('magnetic-button');
    let dx=0, dy=0;
    button.addEventListener('pointermove', e => {
      if (!enabled.matches || e.pointerType !== 'mouse' || button.disabled) return;
      const r = button.getBoundingClientRect();
      const limit = button.classList.contains('slider-btn') ? 3 : 7;
      dx = Math.max(-limit, Math.min(limit, (e.clientX - (r.left - dx + r.width/2)) * .16));
      dy = Math.max(-limit, Math.min(limit, (e.clientY - (r.top - dy + r.height/2)) * .16));
      button.classList.add('magnetic-active');
      button.style.translate = `${dx}px ${dy}px`;
    });
    ['pointerleave','pointercancel','blur','click'].forEach(event => button.addEventListener(event, () => { dx=dy=0; reset(button); }));
  });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  window.addEventListener('scroll', hide, {passive:true});
  document.addEventListener('visibilitychange', hide);
  enabled.addEventListener('change', () => { hide(); buttons.forEach(reset); });
})();
