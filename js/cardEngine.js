"use strict";

(() => {
  const DIMS = [
    "tired",
    "happy",
    "quiet",
    "energy"
  ];


  /* ========================================
     レアリティ出現率
     NORMAL     80%
     RARE       15%
     FULL MOON   4%
     SECRET      1%
  ======================================== */

  const RARITY_RATES = {
    normal: 0.80,
    rare: 0.15,
    full_moon: 0.04,
    secret: 0.01
  };

  function normalizeRarity(value) {
    return String(value || "NORMAL")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  }


  /* ========================================
     診断スコアとの距離
  ======================================== */

  function distance(score, target) {
    return DIMS.reduce(
      (sum, key) =>
        sum +
        Math.abs(
          Number(score?.[key] || 0) -
          Number(target?.[key] || 0)
        ),
      0
    );
  }


  /* ========================================
     固定シード
  ======================================== */

  function seed(text) {
    return [...String(text || "")]
      .reduce(
        (number, char) =>
          (
            number * 31 +
            char.charCodeAt(0)
          ) >>> 0,
        2166136261
      );
  }


  /* ========================================
     カード順位付け
  ======================================== */

  function rank(cards, score, order) {
    return cards
      .map(card => {

        const d =
          distance(
            score,
            card?.selection?.target
          );

        const jitter =
          (
            seed(
              `${order}:${card.id}`
            ) % 1000
          ) / 100000;

        const weight =
          Math.max(
            .01,
            Number(card.weight || 1)
          );

        return {
          card,
          value:
            d / weight +
            jitter
        };
      })
      .sort(
        (a, b) =>
          a.value - b.value
      );
  }


  /* ========================================
     レアリティ抽選
  ======================================== */

  function pickRarity(orderNumber) {

    const number =
      seed(`${orderNumber}:rarity`) % 10000;

    const roll = number / 10000;

    if (roll < RARITY_RATES.secret) {
      return "secret";
    }

    if (roll < RARITY_RATES.secret + RARITY_RATES.full_moon) {
      return "full_moon";
    }

    if (roll < RARITY_RATES.secret + RARITY_RATES.full_moon + RARITY_RATES.rare) {
      return "rare";
    }

    return "normal";
  }

  /* ========================================
     カード選択
  ======================================== */

  function select(
    cards,
    score,
    options = {}
  ) {

    if (
      !Array.isArray(cards) ||
      !cards.length
    ) {
      throw new Error(
        "カードデータがありません。"
      );
    }


    /* ----------------------------------------
       forcedId がある場合は最優先
    ---------------------------------------- */

    const forced =
      options.forcedId &&
      cards.find(
        card =>
          card.id ===
          options.forcedId
      );

    if (forced) {
      return forced;
    }


    /* ----------------------------------------
       まずレアリティ抽選
    ---------------------------------------- */

    const rarity =
      pickRarity(
        options.orderNumber
      );


    /* ----------------------------------------
       抽選されたレアリティだけに絞る
    ---------------------------------------- */

    let candidates =
      cards.filter(
        card =>
          normalizeRarity(card.rarity) === rarity
      );


    /*
      万一そのレアリティのカードが
      1枚も無い場合は全カードへ戻す
    */
    if (!candidates.length) {
      candidates = cards;
    }


    /* ----------------------------------------
       その中から診断に最も合うカード
    ---------------------------------------- */

    return rank(
      candidates,
      score,
      options.orderNumber
    )[0].card;
  }


  /* ========================================
     テキスト候補選択
  ======================================== */

  function pick(
    array,
    key,
    variants
  ) {

    if (
      !Array.isArray(array) ||
      !array.length
    ) {
      return "";
    }

    if (
      Number.isInteger(
        variants[key]
      ) &&
      array[variants[key]]
    ) {
      return array[
        variants[key]
      ];
    }

    const index =
      seed(key) %
      array.length;

    variants[key] =
      index;

    return array[index];
  }


  /* ========================================
     カード本文解決
  ======================================== */

  function resolve(
    card,
    stored = {}
  ) {

    const variants = { ...stored };
    const id = card.id;

    const diagnosisText =
      typeof card.diagnosis === "string"
        ? card.diagnosis
        : pick(
            card?.diagnosis?.bodies,
            `${id}:diagnosis`,
            variants
          );

    const masterComment =
      typeof card.comment === "string"
        ? card.comment
        : pick(
            card?.masterComments,
            `${id}:comment`,
            variants
          );

    const dessert =
      typeof card.dessert === "string"
        ? card.dessert
        : pick(
            card?.desserts,
            `${id}:dessert`,
            variants
          );

    const luckyItem =
      typeof card.luckyItem === "string"
        ? card.luckyItem
        : pick(
            card?.luckyItems,
            `${id}:item`,
            variants
          );

    const constellation =
      typeof card.constellation === "string"
        ? {
            name: card.constellation,
            text: "今夜のあなたを静かに見守る星のかたち。"
          }
        : (card.constellation || {});

    const result = {
      ...card,
      rarity: normalizeRarity(card.rarity),
      diagnosisText,
      masterComment,
      dessert,
      luckyItem,
      constellation
    };

    return { card: result, variants };
  }

  /* ========================================
     外部公開
  ======================================== */

  window.MidnightCardEngine = {
    select,
    resolve,
    rank,
    pickRarity
  };

})();