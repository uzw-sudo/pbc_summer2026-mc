"use strict";
(() => {
  const canvas = document.getElementById("nightSky");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const stars = [];
  const meteors = [];

  let width = 0;
  let height = 0;
  let ratio = 1;
  let animationId = 0;
  let automaticTimer = 0;

  function resize() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars.length = 0;

    const count = Math.max(75, Math.round((width * height) / 8500));

    for (let index = 0; index < count; index += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.25 + .2,
        alpha: Math.random() * .6 + .15,
        speed: Math.random() * .0011 + .00028,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function shoot(options = {}) {
    const direction = options.direction || "left";
    const startX = options.x ?? width * (.68 + Math.random() * .25);
    const startY = options.y ?? height * (.06 + Math.random() * .28);
    const speed = options.speed ?? (11 + Math.random() * 5);
    const angle = options.angle ?? (.46 + Math.random() * .18);
    const length = options.length ?? (95 + Math.random() * 85);

    meteors.push({
      x: startX,
      y: startY,
      vx: (direction === "left" ? -1 : 1) * speed,
      vy: speed * angle,
      length,
      life: 1,
      decay: options.decay ?? .018,
      width: options.width ?? (1 + Math.random() * .8)
    });

    window.dispatchEvent(new CustomEvent("midnight:shooting-star"));
  }

  function drawStars(time) {
    for (const star of stars) {
      const alpha = star.alpha + Math.sin(time * star.speed + star.phase) * .16;
      context.beginPath();
      context.fillStyle = `rgba(244,239,214,${Math.max(.07, alpha)})`;
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  function drawMeteors() {
    for (let index = meteors.length - 1; index >= 0; index -= 1) {
      const meteor = meteors[index];
      const magnitude = Math.hypot(meteor.vx, meteor.vy) || 1;
      const tailX = meteor.x - (meteor.vx / magnitude) * meteor.length;
      const tailY = meteor.y - (meteor.vy / magnitude) * meteor.length;
      const gradient = context.createLinearGradient(tailX, tailY, meteor.x, meteor.y);

      gradient.addColorStop(0, "rgba(255,248,220,0)");
      gradient.addColorStop(.72, `rgba(255,242,194,${meteor.life * .55})`);
      gradient.addColorStop(1, `rgba(255,255,245,${meteor.life})`);

      context.beginPath();
      context.strokeStyle = gradient;
      context.lineWidth = meteor.width;
      context.lineCap = "round";
      context.moveTo(tailX, tailY);
      context.lineTo(meteor.x, meteor.y);
      context.stroke();

      context.beginPath();
      context.fillStyle = `rgba(255,255,240,${meteor.life})`;
      context.arc(meteor.x, meteor.y, meteor.width * 1.3, 0, Math.PI * 2);
      context.fill();

      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.life -= meteor.decay;

      if (meteor.life <= 0 || meteor.x < -meteor.length || meteor.y > height + meteor.length) {
        meteors.splice(index, 1);
      }
    }
  }

  function draw(time = 0) {
    context.clearRect(0, 0, width, height);
    drawStars(time);
    drawMeteors();
    animationId = requestAnimationFrame(draw);
  }

  function scheduleAutomatic() {
    clearTimeout(automaticTimer);
    const delay = 12000 + Math.random() * 13000;
    automaticTimer = window.setTimeout(() => {
      if (!document.hidden) shoot();
      scheduleAutomatic();
    }, delay);
  }

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
      clearTimeout(automaticTimer);
    } else {
      animationId = requestAnimationFrame(draw);
      scheduleAutomatic();
    }
  });

  resize();
  animationId = requestAnimationFrame(draw);
  scheduleAutomatic();

  window.MidnightNightSky = {
    shoot,
    burst(count = 3, interval = 260) {
      for (let index = 0; index < count; index += 1) {
        window.setTimeout(() => shoot({
          x: width * (.62 + Math.random() * .3),
          y: height * (.04 + Math.random() * .22),
          speed: 12 + Math.random() * 5
        }), index * interval);
      }
    }
  };
})();
