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
  const catGuestName = document.getElementById("catGuestName");
  const catNameError = document.getElementById("catNameError");
  const catReceiveButton = document.getElementById("catReceiveButton");
  const catDoneButton = document.getElementById("catDoneButton");
  const catCupName = document.getElementById("catCupName");
  const catDrinkName = document.getElementById("catDrinkName");
  const catDrinkNote = document.getElementById("catDrinkNote");

  const TAKEOUTS = [
    { name: "月夜のカフェオレ", note: "やわらかなミルクと、夜更けのための深煎り。" },
    { name: "夜風のアイス珈琲", note: "帰り道の熱を、少しだけ冷ましてくれる一杯。" },
    { name: "焦がし蜂蜜ラテ", note: "香ばしい甘さを、ほんの少しだけ多めに。" },
    { name: "黒糖ミルク珈琲", note: "静かな甘さが、夜の終わりまで残ります。" },
    { name: "星屑ショコラ", note: "カカオのほろ苦さに、小さな甘い余韻。" },
    { name: "真夜中のデカフェ", note: "眠りを邪魔しない、帰る前のやさしい一杯。" }
  ];
  const RARE_TAKEOUT = {
    name: "猫印の気まぐれ珈琲",
    note: "メニューにはないらしい。猫だけが知っている一杯。"
  };

  let isEntering = false;

  function enterShop() {
    if (isEntering) return;
    isEntering = true;

    transition?.classList.add("is-active");
    transition?.setAttribute("aria-hidden", "false");

    window.setTimeout(() => {
      window.location.href = "./menu/index.html";
    }, 1750);
  }

  function openCatTakeout() {
    if (!catModal) return;
    catNameStep.hidden = false;
    catCupStep.hidden = true;
    catNameError.textContent = "";
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
    // 約8%だけ猫印の隠しメニュー。
    if (Math.random() < .08) return RARE_TAKEOUT;
    return TAKEOUTS[Math.floor(Math.random() * TAKEOUTS.length)];
  }

  function receiveTakeout() {
    const guestName = String(catGuestName?.value || "").trim();
    if (!guestName) {
      catNameError.textContent = "カップに書く名前を教えてください。";
      catGuestName?.focus();
      return;
    }

    const drink = chooseTakeout();
    catNameError.textContent = "";
    catCupName.textContent = guestName;
    catDrinkName.textContent = drink.name;
    catDrinkNote.textContent = drink.note;
    catNameStep.hidden = true;
    catCupStep.hidden = false;

    try {
      localStorage.setItem("midnightCoffee.catTakeoutName", guestName);
      localStorage.setItem("midnightCoffee.catTakeoutDrink", drink.name);
    } catch (_) {}
  }

  enterButton?.addEventListener("click", enterShop);
  moonButton?.addEventListener("click", enterShop);

  catEyesButton?.addEventListener("click", openCatTakeout);
  catClose?.addEventListener("click", closeCatTakeout);
  catDoneButton?.addEventListener("click", closeCatTakeout);
  catReceiveButton?.addEventListener("click", receiveTakeout);
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
