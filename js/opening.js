"use strict";

(() => {
  const enterButton = document.getElementById("enterButton");
  const moonButton = document.getElementById("moonButton");
  const transition = document.getElementById("openingTransition");

  const catEyesButton = document.getElementById("catEyesButton");
  const catModal = document.getElementById("catTakeoutModal");
  const catClose = document.getElementById("catTakeoutClose");

  const catNameStep = document.getElementById("catNameStep");
  const catCupStep = document.getElementById("catCupStep");
  const catCompleteStep = document.getElementById("catCompleteStep");
  const catCardStep = document.getElementById("catCardStep");

  const catGuestName = document.getElementById("catGuestName");
  const catNameError = document.getElementById("catNameError");
  const catReceiveButton = document.getElementById("catReceiveButton");
  const catDoneButton = document.getElementById("catDoneButton");
  const catShowCardButton = document.getElementById("catShowCardButton");
  const catCardCloseButton = document.getElementById("catCardCloseButton");

  const catCupName = document.getElementById("catCupName");
  const catCupDrink = document.getElementById("catCupDrink");
  const catDrinkName = document.getElementById("catDrinkName");
  const catDrinkNote = document.getElementById("catDrinkNote");

  const cardPreview = document.getElementById("takeoutCardPreview");
  const takeoutCardCupName = document.getElementById("takeoutCardCupName");
  const takeoutCardCupDrink = document.getElementById("takeoutCardCupDrink");
  const takeoutCardName = document.getElementById("takeoutCardName");
  const takeoutCardDrink = document.getElementById("takeoutCardDrink");
  const takeoutCardDate = document.getElementById("takeoutCardDate");
  const catCardStatus = document.getElementById("catCardStatus");
  const catSaveCardButton = document.getElementById("catSaveCardButton");
  const catShareCardButton = document.getElementById("catShareCardButton");
  const catXShareButton = document.getElementById("catXShareButton");

  const CUP_IMAGE_PATH = "./assets/images/takeout-cup.png";
  const SHARE_URL = "https://uzw-sudo.github.io/midnightcoffee-oideyasu/midnight_coffee_v9/";

  const TAKEOUTS = [
    { name: "月夜のカフェオレ", note: "やわらかなミルクと、夜更けのための深煎り。", theme: "navy" },
    { name: "夜風のアイス珈琲", note: "帰り道の熱を、少しだけ冷ましてくれる一杯。", theme: "navy" },
    { name: "焦がし蜂蜜ラテ", note: "香ばしい甘さを、ほんの少しだけ多めに。", theme: "amber" },
    { name: "黒糖ミルク珈琲", note: "静かな甘さが、夜の終わりまで残ります。", theme: "amber" },
    { name: "星屑ショコラ", note: "カカオのほろ苦さに、小さな甘い余韻。", theme: "rose" },
    { name: "真夜中のデカフェ", note: "眠りを邪魔しない、帰る前のやさしい一杯。", theme: "green" }
  ];
  const RARE_TAKEOUT = {
    name: "猫印の気まぐれ珈琲",
    note: "メニューにはないらしい。猫だけが知っている一杯。",
    theme: "purple",
    rare: true
  };

  let isEntering = false;
  let reward = null;

  function enterShop() {
    if (isEntering) return;
    isEntering = true;
    transition?.classList.add("is-active");
    transition?.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      window.location.href = "./menu/index.html";
    }, 1750);
  }

  function showStep(step) {
    [catNameStep, catCupStep, catCompleteStep, catCardStep].forEach(node => {
      if (node) node.hidden = node !== step;
    });
  }

  function openCatTakeout() {
    if (!catModal) return;
    reward = null;
    catNameError.textContent = "";
    catCardStatus.textContent = "";
    showStep(catNameStep);
    catModal.classList.add("is-open");
    catModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => catGuestName?.focus(), 180);
  }

  function closeCatTakeout() {
    if (!catModal) return;
    catModal.classList.remove("is-open");
    catModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    catEyesButton?.focus();
  }

  function chooseTakeout() {
    if (Math.random() < .08) return { ...RARE_TAKEOUT };
    return { ...TAKEOUTS[Math.floor(Math.random() * TAKEOUTS.length)] };
  }

  function todayLabel() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  }

  function receiveTakeout() {
    const guestName = String(catGuestName?.value || "").trim();
    if (!guestName) {
      catNameError.textContent = "カップに書く名前を教えてください。";
      catGuestName?.focus();
      return;
    }

    const drink = chooseTakeout();
    reward = {
      guestName,
      ...drink,
      date: todayLabel()
    };

    catNameError.textContent = "";
    catCupName.textContent = guestName;
    catCupDrink.textContent = drink.name;
    catDrinkName.textContent = drink.name;
    catDrinkNote.textContent = drink.note;
    showStep(catCupStep);

    try {
      localStorage.setItem("midnightCoffee.catTakeoutReward", JSON.stringify(reward));
    } catch (_) {}
  }

  function showComplete() {
    if (!reward) return;
    showStep(catCompleteStep);
  }

  function renderCard() {
    if (!reward) return;
    takeoutCardCupName.textContent = reward.guestName;
    takeoutCardCupDrink.textContent = reward.name;
    takeoutCardName.textContent = reward.guestName;
    takeoutCardDrink.textContent = reward.name;
    takeoutCardDate.textContent = reward.date;
    cardPreview.dataset.theme = reward.theme || "navy";
    catCardStatus.textContent = reward.rare ? "……それ、猫がたまにしか出さないやつだぞ。" : "";
    showStep(catCardStep);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function themeColors(theme) {
    const map = {
      navy:   ["#071320", "#0d1822", "#1a100d"],
      amber:  ["#1d1208", "#2a1709", "#0f0a08"],
      rose:   ["#211017", "#2d1420", "#10090d"],
      green:  ["#0b1915", "#11251e", "#080e0c"],
      purple: ["#150d22", "#29163b", "#0b0710"]
    };
    return map[theme] || map.navy;
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function fitText(ctx, text, maxWidth, startSize, minSize, family) {
    let size = startSize;
    do {
      ctx.font = `${size}px ${family}`;
      if (ctx.measureText(text).width <= maxWidth) return size;
      size -= 2;
    } while (size >= minSize);
    return minSize;
  }

  async function makeCardBlob() {
    if (!reward) throw new Error("reward missing");

    // Webフォントが使える場合は保存PNGにも同じ筆跡を反映
    try {
      await document.fonts?.load('600 48px "Klee One"');
      await document.fonts?.ready;
    } catch (_) {}

    const base = await loadImage("./assets/images/takeout-card.png");
    const canvas = document.createElement("canvas");

    // 台紙PNGのネイティブ解像度をそのまま保存（画質劣化なし）
    canvas.width = base.naturalWidth || 1024;
    canvas.height = base.naturalHeight || 1536;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;
    const sx = W / 1024;
    const sy = H / 1536;

    // 同じ名前なら毎回同じ微妙な傾き＝「鵜沢さんの筆跡」
    const seed = [...reward.guestName].reduce(
      (n, c) => ((n * 31 + c.charCodeAt(0)) >>> 0),
      2166136261
    );
    const tilt = ((seed % 31) - 15) / 10; // -1.5° ～ +1.5°

    function drawFittedText({
      text,
      x,
      y,
      maxWidth,
      size,
      minSize,
      family,
      weight = 500,
      align = "left",
      color = "#26180f",
      rotate = 0
    }) {
      ctx.save();
      ctx.translate(x * sx, y * sy);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;

      let px = size * sy;
      const minPx = minSize * sy;
      const widthPx = maxWidth * sx;

      while (px > minPx) {
        ctx.font = `${weight} ${px}px ${family}`;
        if (ctx.measureText(text).width <= widthPx) break;
        px -= 2;
      }
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    // ===== カップ上 =====
    drawFittedText({
      text: reward.guestName,
      x: 512,
      y: 752,
      maxWidth: 255,
      size: 46,
      minSize: 26,
      family: '"Klee One", "Noto Serif JP", cursive',
      weight: 600,
      align: "center",
      rotate: tilt
    });

    drawFittedText({
      text: reward.name,
      x: 512,
      y: 842,
      maxWidth: 315,
      size: 26,
      minSize: 17,
      family: '"Noto Serif JP", serif',
      weight: 500,
      align: "center"
    });

    // SECRETだけ小さな肉球サイン
    if (reward.rare) {
      ctx.save();
      ctx.fillStyle = "#26180f";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${24 * sy}px serif`;
      ctx.fillText("🐾", 655 * sx, 752 * sy);
      ctx.restore();
    }

// ===== 下部欄 =====

// FOR
drawFittedText({
  text: reward.guestName,
  x: 370,
  y: 1170,
  maxWidth: 390,
  size: 40,
  minSize: 24,
  family: '"Klee One", "Noto Serif JP", cursive',
  weight: 600,
  rotate: tilt
});

// DRINK
drawFittedText({
  text: reward.name,
  x: 370,
  y: 1257,
  maxWidth: 390,
  size: 26,
  minSize: 17,
  family: '"Noto Serif JP", serif',
  weight: 500
});

// DATE
drawFittedText({
  text: reward.date,
  x: 370,
  y: 1342,
  maxWidth: 390,
  size: 29,
  minSize: 21,
  family: '"Cormorant Garamond", "Noto Serif JP", serif',
  weight: 600
});

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error("PNG creation failed")),
        "image/png"
      );
    });
  }

  function filename() {
    const safe = String(reward?.guestName || "guest")
      .replace(/[\\/:*?"<>|]/g, "_")
      .slice(0, 20);
    return `midnight_takeout_${safe}.png`;
  }

  async function saveCard() {
    try {
      catCardStatus.textContent = "カードを作っています……";
      const blob = await makeCardBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      catCardStatus.textContent = "テイクアウトカードを保存しました。";
    } catch (error) {
      console.error(error);
      catCardStatus.textContent = "保存できませんでした。";
    }
  }

  function shareText() {
    if (!reward) return "";
    const rareLine = reward.rare ? "\n🐾 猫だけが知っている秘密の一杯でした。" : "";
    return `真夜中珈琲屋台で猫を見つけました。\nお礼にもらったテイクアウトは\n☕「${reward.name}」${rareLine}\n\n#真夜中珈琲屋台 #PBT夏祭り2026`;
  }

  async function shareCard() {
    try {
      catCardStatus.textContent = "シェア用カードを作っています……";
      const blob = await makeCardBlob();
      const file = new File([blob], filename(), { type: "image/png" });
      const data = {
        title: "真夜中珈琲屋台 TAKE OUT",
        text: shareText(),
        url: SHARE_URL
      };

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ ...data, files: [file] });
        catCardStatus.textContent = "シェア画面を開きました。";
      } else if (navigator.share) {
        await navigator.share(data);
        catCardStatus.textContent = "シェア画面を開きました。画像は「画像を保存」から使えます。";
      } else {
        await navigator.clipboard.writeText(`${shareText()}\n${SHARE_URL}`);
        catCardStatus.textContent = "投稿文とURLをコピーしました。画像は「画像を保存」から使えます。";
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(error);
        catCardStatus.textContent = "シェアできませんでした。";
      }
    }
  }

  function shareOnX() {
    const text = shareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SHARE_URL)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    catCardStatus.textContent = "Xの投稿画面を開きました。画像を添付する場合は先に保存してください。";
  }

  enterButton?.addEventListener("click", enterShop);
  moonButton?.addEventListener("click", enterShop);

  catEyesButton?.addEventListener("click", openCatTakeout);
  catClose?.addEventListener("click", closeCatTakeout);
  catReceiveButton?.addEventListener("click", receiveTakeout);
  catDoneButton?.addEventListener("click", showComplete);
  catShowCardButton?.addEventListener("click", renderCard);
  catCardCloseButton?.addEventListener("click", closeCatTakeout);

  catSaveCardButton?.addEventListener("click", saveCard);
  catShareCardButton?.addEventListener("click", shareCard);
  catXShareButton?.addEventListener("click", shareOnX);

  catGuestName?.addEventListener("keydown", event => {
    if (event.key === "Enter") receiveTakeout();
  });
  catModal?.querySelector("[data-cat-close]")?.addEventListener("click", closeCatTakeout);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && catModal?.classList.contains("is-open")) {
      closeCatTakeout();
    }
  });
})();
