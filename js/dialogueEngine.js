"use strict";
(() => {
  let token = 0;

  function delayFor(character, baseSpeed) {
    if (character === "、") return baseSpeed + 170;
    if (character === "。") return baseSpeed + 380;
    if (character === "…") return baseSpeed + 260;
    if (character === "！" || character === "？") return baseSpeed + 280;
    if (character === " ") return Math.max(20, baseSpeed * .45);
    return baseSpeed;
  }

  async function type(element, message, speed = 60) {
    if (!element) return;

    const currentToken = ++token;
    element.textContent = "";

    for (const character of [...String(message || "")]) {
      if (currentToken !== token) return;
      element.textContent += character;
      await new Promise(resolve => {
        window.setTimeout(resolve, delayFor(character, speed));
      });
    }
  }

  function stop() {
    token += 1;
  }

  function choose(lines, seedText = "") {
    if (!Array.isArray(lines)) return String(lines || "");
    if (!lines.length) return "";

    const number = [...seedText]
      .reduce((sum, character) => sum + character.charCodeAt(0), 0);

    return lines[number % lines.length];
  }

  window.MidnightDialogue = { type, stop, choose };
})();
