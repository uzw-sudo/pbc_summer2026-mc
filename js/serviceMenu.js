"use strict";
(() => {
  const dialogue = document.getElementById("masterDialogue");
  const menu = document.getElementById("serviceMenu");
  const coffee = document.getElementById("coffeeChoice");
  const sparkler = document.getElementById("sparklerChoice");
  const transition = document.getElementById("menuTransition");
  const transitionText = document.getElementById("transitionText");

  let moving = false;
  let starConversationDone = false;

  const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  async function speak(message, speed = 62) {
    await window.MidnightDialogue?.type(dialogue, message, speed);
  }

  async function intro() {
    await speak("いらっしゃい……今日は、どうする？");
    await wait(450);
    await speak("珈琲でも淹れるか？　それとも、線香花火を一本持ってくか？");
    menu.hidden = false;
  }

  async function chooseCoffee() {
    if (moving) return;
    moving = true;
    coffee.classList.add("is-selected");
    await speak("珈琲だな？……なら、少し話を聞かせてくれるか？");
    transitionText.textContent = "店主が注文票を差し出した。";
    transition.classList.add("is-active");
    await wait(850);
    location.href = "../shop/index.html";
  }

  async function chooseSparkler() {
    if (moving) return;
    moving = true;
    sparkler.classList.add("is-selected");
    await speak("線香花火な。……一本だけだぜ？火ぃ、気ぃつけろよ？");
    transitionText.textContent = "店主から、細い花火を一本受け取った";
    transition.classList.add("is-active");
    await wait(950);
    location.href = "../sparkler/index.html";
  }

  async function reactToStar() {
    if (moving || starConversationDone || menu.hidden) return;
    starConversationDone = true;
    await wait(300);
    await speak("お。");
    await wait(470);
    await speak("今見えたか？　……願い事しとけよ");
  }

  coffee?.addEventListener("click", chooseCoffee);
  sparkler?.addEventListener("click", chooseSparkler);
  window.addEventListener("midnight:shooting-star", reactToStar);
  document.addEventListener("DOMContentLoaded", intro);
})();
