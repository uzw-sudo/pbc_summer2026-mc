"use strict";

(() => {
  const DEFAULT_POINTS = [
    [18, 66],
    [31, 36],
    [48, 52],
    [64, 26],
    [78, 56],
    [58, 78],
    [35, 76]
  ];

  function getPoints(card) {
    const raw =
      card?.coffee?.constellation?.points ??
      card?.constellation?.points;

    if (!Array.isArray(raw) || raw.length < 2) {
      return DEFAULT_POINTS;
    }

    return raw
      .map(point => {
        if (Array.isArray(point)) {
          return [
            Number(point[0]),
            Number(point[1])
          ];
        }

        return [
          Number(point?.x),
          Number(point?.y)
        ];
      })
      .filter(([x, y]) =>
        Number.isFinite(x) &&
        Number.isFinite(y)
      );
  }


  function renderConstellation(card) {
    const canvas = document.getElementById("starChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    const width = canvas.clientWidth || 280;
    const height = canvas.clientHeight || 210;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);


    /* ========================================
       星座ポイント
    ======================================== */

    const points = getPoints(card).map(([x, y]) => [
      width * (x / 100),
      height * (y / 100)
    ]);


    /* ========================================
       レアリティ判定
    ======================================== */

    const rarity = document.getElementById("resultCard")
      ?.dataset.rarity || "normal";

    const isFullMoon = rarity === "full_moon";


    /* ========================================
       カードIDから星配置用seedを生成
    ======================================== */

    const seed = String(card?.id ?? "M-001")
      .split("")
      .reduce(
        (sum, character) =>
          sum + character.charCodeAt(0),
        0
      );


    /* ========================================
       背景の小さな星
    ======================================== */

    for (let index = 0; index < 26; index += 1) {
      const x =
        (((index * 47) + (seed * 13)) % 100) /
        100 *
        width;

      const y =
        (((index * 71) + (seed * 7)) % 100) /
        100 *
        height;

      const radius =
        index % 4 === 0
          ? 1.15
          : .65;

      ctx.beginPath();

      ctx.fillStyle = isFullMoon
        ? `rgba(
            214,
            174,
            96,
            ${.22 + (index % 5) * .07}
          )`
        : `rgba(
            238,
            222,
            177,
            ${.18 + (index % 5) * .06}
          )`;

      ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }


    /* ========================================
       星座をつなぐ線
    ======================================== */

    ctx.beginPath();

    points.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = isFullMoon
      ? "rgba(218, 178, 96, .82)"
      : "rgba(224, 205, 153, .62)";

    ctx.lineWidth =
      isFullMoon
        ? 1.25
        : 1;

    ctx.stroke();


    /* ========================================
       星本体＋グロー
    ======================================== */

    points.forEach(([x, y], index) => {
      const radius =
        index % 3 === 0
          ? 2.6
          : 1.8;


      /* 光 */
      const glow = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius * 4
      );

      glow.addColorStop(
        0,
        isFullMoon
          ? "rgba(255, 232, 172, 1)"
          : "rgba(255, 246, 210, 1)"
      );

      glow.addColorStop(
        .25,
        isFullMoon
          ? "rgba(224, 177, 91, .92)"
          : "rgba(244, 222, 167, .82)"
      );

      glow.addColorStop(
        1,
        isFullMoon
          ? "rgba(224, 177, 91, 0)"
          : "rgba(244, 222, 167, 0)"
      );


      /* グロー描画 */
      ctx.beginPath();

      ctx.fillStyle = glow;

      ctx.arc(
        x,
        y,
        radius * 4,
        0,
        Math.PI * 2
      );

      ctx.fill();


      /* 星の中心 */
      ctx.beginPath();

      ctx.fillStyle = isFullMoon
        ? "#ffe0a3"
        : "#fff7dc";

      ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
      );

      ctx.fill();


      /* ========================================
         FULL MOONだけ小さな十字光
      ======================================== */

      if (isFullMoon && index % 3 === 0) {
        ctx.save();

        ctx.strokeStyle =
          "rgba(255, 222, 158, .72)";

        ctx.lineWidth = .7;

        ctx.beginPath();

        ctx.moveTo(
          x - radius * 3.2,
          y
        );

        ctx.lineTo(
          x + radius * 3.2,
          y
        );

        ctx.moveTo(
          x,
          y - radius * 3.2
        );

        ctx.lineTo(
          x,
          y + radius * 3.2
        );

        ctx.stroke();

        ctx.restore();
      }
    });
  }


  /* ========================================
     外部公開
  ======================================== */

  window.renderConstellation =
    renderConstellation;
})();