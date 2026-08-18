"use strict";

(() => {
  const LABELS = [
    "香り",
    "苦み",
    "甘み",
    "酸味",
    "コク"
  ];


  /* ========================================
     Flavorデータを取得
  ======================================== */

  function normalizeFlavor(card) {
    const source =
      card?.coffee?.flavor ??
      card?.flavor ??
      {};

    if (Array.isArray(source)) {
      return LABELS.map((_, index) =>
        Number(source[index]) || 0
      );
    }

    const keys = [
      "aroma",
      "bitterness",
      "sweetness",
      "acidity",
      "body"
    ];

    const japaneseKeys = [
      "香り",
      "苦み",
      "甘み",
      "酸味",
      "コク"
    ];

    return keys.map((key, index) =>
      Number(
        source[key] ??
        source[japaneseKeys[index]] ??
        0
      )
    );
  }


  /* ========================================
     Flavor Chart描画
  ======================================== */

  function renderFlavorChart(card) {
    const canvas =
      document.getElementById("flavorChart");

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;


    /* ========================================
       Canvas解像度
    ======================================== */

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    const width =
      canvas.clientWidth || 280;

    const height =
      canvas.clientHeight || 210;

    canvas.width =
      Math.round(width * dpr);

    canvas.height =
      Math.round(height * dpr);

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    /* ========================================
       Flavor値
    ======================================== */

    const values =
      normalizeFlavor(card).map(value =>
        Math.max(
          0,
          Math.min(5, value)
        )
      );


    /* ========================================
       基本座標
    ======================================== */

    const centerX =
      width / 2;

    const centerY =
      height / 2 + 3;

    const radius =
      Math.min(width, height) * .31;

    const angleStep =
      (Math.PI * 2) /
      LABELS.length;

    const startAngle =
      -Math.PI / 2;


    /* ========================================
       RARITY判定
    ======================================== */

    const rarity =
      document
        .getElementById("resultCard")
        ?.dataset.rarity || "normal";

    const isRare = rarity === "rare";
    const isFullMoon = rarity === "full_moon";
    const isSecret = rarity === "secret";


    ctx.lineJoin = "round";


    /* ========================================
       色設定
    ======================================== */

    let gridColor;
    let axisColor;
    let fillColor;
    let strokeColor;
    let labelColor;
    let shadowColor;
    let shadowBlur;
    let resultLineWidth;


    /* FULL MOON */
    if (isFullMoon) {
      gridColor =
        "rgba(218, 177, 94, .42)";

      axisColor =
        "rgba(218, 177, 94, .34)";

      fillColor =
        "rgba(176, 112, 45, .48)";

      strokeColor =
        "rgba(244, 205, 119, .95)";

      labelColor =
        "#ead9b6";

      shadowColor =
        "rgba(218, 165, 75, .32)";

      shadowBlur = 7;

      resultLineWidth = 1.1;
    }


    /* SECRET */
    else if (isSecret) {
      gridColor = "rgba(70, 45, 25, .26)";
      axisColor = "rgba(70, 45, 25, .20)";
      fillColor = "rgba(92, 55, 28, .16)";
      strokeColor = "rgba(55, 31, 16, .88)";
      labelColor = "rgba(48, 29, 17, .90)";
      shadowColor = "transparent";
      shadowBlur = 0;
      resultLineWidth = 1.45;
    }

    /* RARE */
    else if (isRare) {
      /* 五角形の目盛り線：少し明るく */
      gridColor =
        "rgba(235, 205, 125, .48)";

      /* 中央から伸びる線 */
      axisColor =
        "rgba(235, 205, 125, .38)";

      /* 診断結果の塗り */
      fillColor =
        "rgba(202, 153, 65, .32)";

      /* 診断結果の外周 */
      strokeColor =
        "rgba(255, 226, 151, .98)";

      /* 香り・コク・甘み等 */
      labelColor =
        "#f2dfad";

      /* ほんのり金色発光 */
      shadowColor =
        "rgba(240, 201, 100, .46)";

      shadowBlur = 8;

      resultLineWidth = 1.35;
    }


    /* NORMAL */
    else {
      gridColor =
        "rgba(48, 29, 16, .22)";

      axisColor =
        "rgba(48, 29, 16, .18)";

      fillColor =
        "rgba(75, 44, 20, .18)";

      strokeColor =
        "rgba(48, 27, 14, .88)";

      labelColor =
        "rgba(39, 24, 14, .86)";

      shadowColor =
        "transparent";

      shadowBlur = 0;

      resultLineWidth = 1.5;
    }


    /* ========================================
       5段階の五角形グリッド
    ======================================== */

    for (
      let level = 1;
      level <= 5;
      level += 1
    ) {
      ctx.beginPath();

      for (
        let index = 0;
        index < LABELS.length;
        index += 1
      ) {
        const angle =
          startAngle +
          index * angleStep;

        const levelRadius =
          radius *
          (level / 5);

        const x =
          centerX +
          Math.cos(angle) *
          levelRadius;

        const y =
          centerY +
          Math.sin(angle) *
          levelRadius;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();

      ctx.strokeStyle =
        gridColor;

      ctx.lineWidth = .8;

      ctx.stroke();
    }


    /* ========================================
       中央から伸びる放射線
    ======================================== */

    for (
      let index = 0;
      index < LABELS.length;
      index += 1
    ) {
      const angle =
        startAngle +
        index * angleStep;

      ctx.beginPath();

      ctx.moveTo(
        centerX,
        centerY
      );

      ctx.lineTo(
        centerX +
        Math.cos(angle) *
        radius,

        centerY +
        Math.sin(angle) *
        radius
      );

      ctx.strokeStyle =
        axisColor;

      ctx.lineWidth = .8;

      ctx.stroke();
    }


    /* ========================================
       診断結果の五角形
    ======================================== */

    ctx.beginPath();

    values.forEach(
      (value, index) => {

        const angle =
          startAngle +
          index * angleStep;

        const valueRadius =
          radius *
          (value / 5);

        const x =
          centerX +
          Math.cos(angle) *
          valueRadius;

        const y =
          centerY +
          Math.sin(angle) *
          valueRadius;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
    );

    ctx.closePath();


    /* ========================================
       診断結果カラー
    ======================================== */

    ctx.fillStyle =
      fillColor;

    ctx.strokeStyle =
      strokeColor;

    ctx.lineWidth =
      resultLineWidth;

    ctx.shadowColor =
      shadowColor;

    ctx.shadowBlur =
      shadowBlur;

    ctx.fill();
    ctx.stroke();


    /* ========================================
       Shadowを必ずリセット
    ======================================== */

    ctx.shadowColor =
      "transparent";

    ctx.shadowBlur = 0;


    /* ========================================
       ラベル
    ======================================== */

    ctx.fillStyle =
      labelColor;

    ctx.font =
      `${Math.max(
        8,
        width * .036
      )}px "Noto Serif JP", serif`;

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";


    LABELS.forEach(
      (label, index) => {

        const angle =
          startAngle +
          index * angleStep;

        const labelRadius =
          radius * 1.28;

        const x =
          centerX +
          Math.cos(angle) *
          labelRadius;

        const y =
          centerY +
          Math.sin(angle) *
          labelRadius;

        ctx.fillText(
          label,
          x,
          y
        );
      }
    );
  }


  /* ========================================
     外部公開
  ======================================== */

  window.renderFlavorChart =
    renderFlavorChart;

})();