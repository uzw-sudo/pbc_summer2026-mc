"use strict";

(() => {
  const enterButton = document.getElementById("enterButton");
  const moonButton = document.getElementById("moonButton");
  const transition = document.getElementById("openingTransition");

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

  enterButton?.addEventListener("click", enterShop);
  moonButton?.addEventListener("click", enterShop);
})();
