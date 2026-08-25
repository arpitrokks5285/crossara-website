(() => {
  const arena = document.getElementById('playgroundArena');
  const crosshair = document.getElementById('playgroundCrosshair');
  const target = document.getElementById('playgroundTarget');
  const scoreEl = document.getElementById('playgroundScore');
  const resetBtn = document.getElementById('playgroundReset');
  const stick = document.getElementById('playgroundStick');
  const knob = document.getElementById('playgroundStickKnob');
  const fireBtn = document.getElementById('playgroundFire');

  if (!arena || !crosshair || !target) return;

  let x = 0.5;
  let y = 0.5;
  let score = 0;
  let stickPointer = null;
  let moveX = 0;
  let moveY = 0;
  let animationFrame = 0;
  const keys = new Set();

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function placeCrosshair() {
    const rect = arena.getBoundingClientRect();
    const padX = Math.min(38, rect.width * 0.08);
    const padY = Math.min(38, rect.height * 0.08);
    const px = padX + x * Math.max(1, rect.width - padX * 2);
    const py = padY + y * Math.max(1, rect.height - padY * 2);
    crosshair.style.left = `${px}px`;
    crosshair.style.top = `${py}px`;
  }

  function placeTarget() {
    const rect = arena.getBoundingClientRect();
    const margin = 46;
    const tx = margin + Math.random() * Math.max(1, rect.width - margin * 2);
    const ty = margin + Math.random() * Math.max(1, rect.height - margin * 2);
    target.style.left = `${tx}px`;
    target.style.top = `${ty}px`;
  }

  function setScore(next) {
    score = next;
    scoreEl.textContent = String(score);
  }

  function fire() {
    const a = arena.getBoundingClientRect();
    const c = crosshair.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const cx = c.left + c.width / 2 - a.left;
    const cy = c.top + c.height / 2 - a.top;
    const tx = t.left + t.width / 2 - a.left;
    const ty = t.top + t.height / 2 - a.top;
    const hitRadius = Math.max(t.width, t.height) * 0.58;
    const hit = Math.hypot(cx - tx, cy - ty) <= hitRadius;

    if (hit) {
      setScore(score + 10);
      target.classList.remove('playground-hit');
      void target.offsetWidth;
      target.classList.add('playground-hit');
      window.setTimeout(placeTarget, 110);
    }
  }

  function reset() {
    x = 0.5;
    y = 0.5;
    setScore(0);
    moveX = 0;
    moveY = 0;
    knob.style.transform = 'translate(-50%,-50%)';
    placeCrosshair();
    placeTarget();
  }

  function updateJoystick(clientX, clientY) {
    const r = stick.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const max = r.width * 0.31;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const distance = Math.hypot(dx, dy);
    if (distance > max) {
      dx = (dx / distance) * max;
      dy = (dy / distance) * max;
    }
    moveX = dx / max;
    moveY = dy / max;
    knob.style.transform = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
  }

  function releaseJoystick() {
    stickPointer = null;
    moveX = 0;
    moveY = 0;
    knob.style.transform = 'translate(-50%,-50%)';
  }

  stick.addEventListener('pointerdown', (e) => {
    stickPointer = e.pointerId;
    stick.setPointerCapture(e.pointerId);
    updateJoystick(e.clientX, e.clientY);
  });
  stick.addEventListener('pointermove', (e) => {
    if (e.pointerId === stickPointer) updateJoystick(e.clientX, e.clientY);
  });
  stick.addEventListener('pointerup', releaseJoystick);
  stick.addEventListener('pointercancel', releaseJoystick);

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','enter'].includes(k)) e.preventDefault();
    if (k === ' ' || k === 'enter') {
      if (!e.repeat) fire();
      return;
    }
    keys.add(k);
  }, { passive: false });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

  arena.addEventListener('click', (e) => {
    if (e.pointerType === 'touch') return;
    fire();
  });
  fireBtn.addEventListener('click', fire);
  resetBtn.addEventListener('click', reset);
  window.addEventListener('resize', () => {
    placeCrosshair();
    placeTarget();
  });

  function tick() {
    let kx = 0;
    let ky = 0;
    if (keys.has('arrowleft') || keys.has('a')) kx -= 1;
    if (keys.has('arrowright') || keys.has('d')) kx += 1;
    if (keys.has('arrowup') || keys.has('w')) ky -= 1;
    if (keys.has('arrowdown') || keys.has('s')) ky += 1;
    const dx = clamp(moveX + kx, -1, 1);
    const dy = clamp(moveY + ky, -1, 1);
    if (dx || dy) {
      const rect = arena.getBoundingClientRect();
      const speed = 4.2;
      x = clamp(x + (dx * speed) / Math.max(1, rect.width), 0, 1);
      y = clamp(y + (dy * speed) / Math.max(1, rect.height), 0, 1);
      placeCrosshair();
    }
    animationFrame = requestAnimationFrame(tick);
  }

  reset();
  animationFrame = requestAnimationFrame(tick);
  window.addEventListener('pagehide', () => cancelAnimationFrame(animationFrame), { once: true });
})();
