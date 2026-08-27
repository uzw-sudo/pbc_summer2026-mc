"use strict";

(() => {
  const STAGES = [
    { id: "bud", name: "蕾", duration: 2600, density: 14, length: 28, speed: .95, dialogue: "火がついた……最初は、まだ小さな蕾だ。" },
    { id: "peony", name: "牡丹", duration: 3000, density: 28, length: 48, speed: 1.45, dialogue: "お。牡丹になったな？……慌てず見てろよ。" },
    { id: "pine", name: "松葉", duration: 3600, density: 48, length: 72, speed: 2.2, dialogue: "いちばん賑やかなところだ。願い事、忘れてないか？" },
    { id: "chrysanthemum", name: "散り菊", duration: 3200, density: 22, length: 42, speed: .72, dialogue: "もうすぐ終わる……最後まで見届けようぜ" }
  ];

  const RESULTS = [
    { name:"牡丹", subtitle:"小さな喜びがひらく夜", rarity:"NORMAL", color:"琥珀色", word:"ほどける", message:"今夜の花火は、ぱっと明るく開く牡丹。\n大きな変化より、すぐそばにある小さな喜びを見つけられる夜です。", master:"「いい顔してたぞ……こっちまで嬉しくなるわ。」" },
    { name:"松葉", subtitle:"一歩を踏み出す夜", rarity:"NORMAL", color:"金緑色", word:"進む", message:"細く鋭い火花が、迷いを切り分ける松葉。\n決め切れなかったことへ、明日は小さな一歩を置けそうです。", master:"「全部決めなくていいよ。自分のペースで歩いていこうぜ？」" },
    { name:"散り菊", subtitle:"手放して眠る夜", rarity:"NORMAL", color:"淡金色", word:"休む", message:"静かにほどけて落ちる散り菊。\n今日抱えていたものを、今夜だけは床へ置いても構いません。", master:"「抱えたまま寝るとさ、疲れ取れないぜ？ここに置いてけ。」" },
    { name:"月雫", subtitle:"心をやわらかくする夜", rarity:"RARE", color:"月白色", word:"やさしく", message:"月明かりを含んだような、淡い雫の火花。\n自分へ向ける言葉を、誰かへ向けるときと同じくらい優しくしてください。", master:"「自分にだけ厳しいの、そろそろやめようぜ？甘やかしてやれって」" },
    { name:"星結び", subtitle:"縁が静かにつながる夜", rarity:"RARE", color:"青金色", word:"つながる", message:"離れた火花が一瞬だけ線を結ぶ星結び。\n忘れていた人や言葉が、近いうちに穏やかな形で戻ってきそうです。", master:"「会いたいなら、会いたいって言えばいい。難しく考えんなよ？」" },
    { name:"願い星", subtitle:"願いが夜空へ届く一本", rarity:"SECRET", color:"銀青色", word:"願う", message:"最後の火玉が落ちる直前、空へ一粒だけ昇った願い星。\n願いは叶うかどうかだけじゃない。口にした瞬間から、進む方向を照らします。", master:"「お。今の見えたかぁ？　……願い事しとけよ。」" },
    { name:"帰り灯", subtitle:"帰る場所を思い出す夜", rarity:"NORMAL", color:"橙色", word:"帰る", message:"消える前に、足元を照らすように残った帰り灯。\n遠くへ行き過ぎた心が、自分の居場所へ戻ってくる夜です。", master:"「帰る場所があるなら、迎えてもらえ。夜道、気ぃつけろよ？」" },
    { name:"夜凪", subtitle:"何もしなくていい夜", rarity:"NORMAL", color:"薄紫色", word:"静かに", message:"風の止んだ水面のように、音もなく燃える夜凪。\n答えを急がず、何も決めない時間が今夜の正解です。", master:"「のんびりいこうぜ？なにも急ぐ必要はないさ。そんな日があってもいいんじゃね？」" }
  ];

  const el = {
    field: document.getElementById("sparklerField"),
    canvas: document.getElementById("sparkCanvas"),
    dialogue: document.getElementById("sparklerDialogue"),
    stageLabel: document.getElementById("stageLabel"),
    stageItems: [...document.querySelectorAll("#stageDots .stage-item")],
    light: document.getElementById("lightButton"),
    wish: document.getElementById("wishButton"),
    status: document.getElementById("sparklerStatus"),
    result: document.getElementById("sparklerResult"),
    again: document.getElementById("againButton"),
    xShare: document.getElementById("sparklerXShareButton"),
    resultName: document.getElementById("resultName"),
    resultRarity: document.getElementById("resultRarity"),
    resultSubtitle: document.getElementById("resultSubtitle"),
    resultMessage: document.getElementById("resultMessage"),
    resultMaster: document.getElementById("resultMaster"),
    resultColor: document.getElementById("resultColor"),
    resultWord: document.getElementById("resultWord")
  };

  const ctx = el.canvas?.getContext("2d");
  let particles = [];
  let stageIndex = -1;
  let running = false;
  let wished = false;
  let animationId = 0;
  let stageTimer = 0;
  let wishSpeaking = false;
  let pendingStageDialogue = "";
  let currentResult = null;

  const SHARE_URL = "https://uzw-sudo.github.io/pbc_summer2026-mc/";

  function resizeCanvas() {
    if (!el.canvas || !ctx) return;
    const rect = el.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.canvas.width = Math.round(rect.width * dpr);
    el.canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function speak(message, speed = 64) {
    if (window.MidnightDialogue?.type) {
      return window.MidnightDialogue.type(el.dialogue, message, speed);
    }
    el.dialogue.textContent = message;
    return Promise.resolve();
  }

  function emitterPoint() {
    const rect = el.canvas.getBoundingClientRect();
    return { x: rect.width / 2, y: rect.height / 2 };
  }

  function spawn(stage) {
    const origin = emitterPoint();
    const count = Math.max(1, Math.round(stage.density / 8));

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = stage.speed * (.65 + Math.random() * .8);

      particles.push({
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity + .1,
        life: 35 + Math.random() * 42,
        maxLife: 70,
        size: .7 + Math.random() * 1.5,
        trail: stage.length,
        hue: 32 + Math.random() * 22
      });
    }
  }

  function draw() {
    if (!ctx || !el.canvas) return;

    const rect = el.canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (running && stageIndex >= 0) {
      spawn(STAGES[stageIndex]);
    }

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += .012;
      particle.vx *= .992;
      particle.life -= 1;

      const alpha = Math.max(0, particle.life / particle.maxLife);
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 5
      );

      gradient.addColorStop(0, `hsla(${particle.hue}, 98%, 88%, ${alpha})`);
      gradient.addColorStop(.25, `hsla(${particle.hue}, 96%, 64%, ${alpha * .95})`);
      gradient.addColorStop(1, `hsla(${particle.hue}, 92%, 50%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `hsla(${particle.hue}, 98%, 72%, ${alpha * .62})`;
      ctx.lineWidth = .65;
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(
        particle.x - particle.vx * Math.min(9, particle.trail / 7),
        particle.y - particle.vy * Math.min(9, particle.trail / 7)
      );
      ctx.stroke();
    }

    particles = particles.filter(particle => particle.life > 0);
    animationId = requestAnimationFrame(draw);
  }

  function updateProgress(activeIndex, finished = false) {
    el.stageItems.forEach((item, index) => {
      item.classList.toggle("is-active", index === activeIndex);
      item.classList.toggle("is-past", finished ? index < 5 : index < activeIndex);
    });
  }

  function setStage(index) {
    stageIndex = index;
    const stage = STAGES[index];

    el.field.dataset.stage = stage.id;
    el.stageLabel.textContent = `${stage.name}の火花を、そっと見守ってね。`;
    updateProgress(index);

    /* 願い事の台詞中は、花火実況を割り込ませない */
    if (wishSpeaking) {
      pendingStageDialogue = stage.dialogue;
      return;
    }

    pendingStageDialogue = "";
    speak(stage.dialogue);
  }

  function nextStage() {
    if (!running) return;

    stageIndex += 1;
    if (stageIndex >= STAGES.length) {
      finish();
      return;
    }

    setStage(stageIndex);
    stageTimer = window.setTimeout(nextStage, STAGES[stageIndex].duration);
  }

  function chooseResult() {
    const value = Math.random();
    let pool = RESULTS.filter(result => result.rarity === "NORMAL");

    if (wished && value < .10) {
      pool = RESULTS.filter(result => result.rarity === "SECRET");
    } else if (wished && value < .38) {
      pool = RESULTS.filter(result => result.rarity === "RARE");
    } else if (!wished && value < .18) {
      pool = RESULTS.filter(result => result.rarity === "RARE");
    }

    return pool[Math.floor(Math.random() * pool.length)] || RESULTS[0];
  }

  async function waitForWishDialogue() {
    while (wishSpeaking) {
      await new Promise(resolve => window.setTimeout(resolve, 80));
    }
  }

  async function finish() {
    running = false;
    window.clearTimeout(stageTimer);

    el.field.classList.remove("is-burning");
    el.field.classList.add("is-finished");
    el.stageLabel.textContent = "火玉が、静かに落ちました。";
    el.wish.disabled = true;
    updateProgress(4, true);
    el.stageItems[4]?.classList.add("is-active");

    await waitForWishDialogue();
    pendingStageDialogue = "";
    await speak("火ぃ、消えたな。……最後まで見てたなら、結果も持って帰れ。");

    const result = chooseResult();
    currentResult = result;
    el.resultName.textContent = result.name;
    el.resultRarity.textContent = result.rarity;
    el.resultSubtitle.textContent = result.subtitle;
    el.resultMessage.textContent = result.message;
    el.resultMaster.textContent = result.master;
    el.resultColor.textContent = result.color;
    el.resultWord.textContent = result.word;

    /* レアリティに応じて結果台紙を切り替える */
    el.result.dataset.rarity = String(result.rarity || "NORMAL").toLowerCase();
    el.result.hidden = false;

    window.setTimeout(() => {
      el.result.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 450);

    if (result.rarity === "SECRET") {
      window.MidnightNightSky?.shoot({ x: innerWidth * .78, y: innerHeight * .13 });
      setTimeout(() => window.MidnightNightSky?.shoot({ x: innerWidth * .58, y: innerHeight * .08 }), 450);
      setTimeout(() => window.MidnightNightSky?.shoot({ x: innerWidth * .86, y: innerHeight * .22 }), 880);
    } else if (result.rarity === "RARE") {
      window.MidnightNightSky?.shoot({ x: innerWidth * .78, y: innerHeight * .13 });
    }
  }

  async function light() {
    if (running) return;

    running = true;
    wished = false;
    wishSpeaking = false;
    pendingStageDialogue = "";
    stageIndex = -1;
    particles = [];

    el.result.hidden = true;
    el.field.classList.remove("is-finished");
    el.field.classList.add("is-burning");
    el.light.disabled = true;
    el.wish.disabled = false;
    el.status.textContent = "花火が落ちないよう、そっと見守ってください。";

    await speak("火、つけるぞ。……手ぇ、動かすなよ。");
    window.setTimeout(nextStage, 450);
  }

  async function wish() {
    if (!running || wished) return;

    wished = true;
    wishSpeaking = true;
    pendingStageDialogue = "";
    el.wish.disabled = true;
    el.status.textContent = "願い事を、火花へ預けました。";

    /* 進行中の花火実況を止め、願い事の台詞を優先する */
    window.MidnightDialogue?.stop?.();
    window.MidnightNightSky?.shoot({ x: innerWidth * .78, y: innerHeight * .12 });
    await speak("お。……今見えたか？　願い事しとけよ。");

    wishSpeaking = false;

    /* 願い事の間に段階が変わっていた場合だけ、最新の実況を再開 */
    if (running && pendingStageDialogue) {
      const dialogue = pendingStageDialogue;
      pendingStageDialogue = "";
      await new Promise(resolve => window.setTimeout(resolve, 420));
      if (running && !wishSpeaking) {
        speak(dialogue);
      }
    }
  }


  function sparklerShareText() {
    const result = currentResult;
    if (!result) return "真夜中珈琲屋台で、線香花火を一本。\n\n#真夜中珈琲屋台 #線香花火 #PBT夏祭り2026";

    const rarity = String(result.rarity || "NORMAL").toUpperCase();
    let lead = "真夜中珈琲屋台で、\n今夜の線香花火が残したものは──";
    if (rarity === "RARE") lead = "真夜中珈琲屋台で、\n少し特別な線香花火が残したものは──";
    if (rarity === "SECRET") lead = "真夜中珈琲屋台で、\n秘密の線香花火が残したものは──";

    return `${lead}\n\n🎇「${result.name}」\n${result.subtitle}\n\n持ち帰る言葉：${result.word}\n\n今夜、あなたの花火は何を残す？\n\n#真夜中珈琲屋台 #線香花火 #PBT夏祭り2026`;
  }

  function shareSparklerOnX() {
    if (!currentResult) return;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(sparklerShareText())}&url=${encodeURIComponent(SHARE_URL)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function reset() {
    window.clearTimeout(stageTimer);

    running = false;
    wished = false;
    wishSpeaking = false;
    pendingStageDialogue = "";
    stageIndex = -1;
    particles = [];

    el.result.hidden = true;
    currentResult = null;
    delete el.result.dataset.rarity;
    el.field.classList.remove("is-burning", "is-finished");
    el.field.dataset.stage = "waiting";
    el.light.disabled = false;
    el.wish.disabled = true;
    el.status.textContent = "";
    el.stageLabel.textContent = "火をつけて、そっと見守ってね。";
    updateProgress(-1);

    speak("もう一本かぁ？　……本当に一本だけだぞ。");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.addEventListener("DOMContentLoaded", () => {
    resizeCanvas();
    animationId = requestAnimationFrame(draw);
    window.setTimeout(() => {
      window.MidnightNightSky?.shoot({ x: innerWidth * .78, y: innerHeight * .12 });
    }, 1400);
  });

  window.addEventListener("resize", resizeCanvas, { passive: true });
  el.light?.addEventListener("click", light);
  el.wish?.addEventListener("click", wish);
  el.again?.addEventListener("click", reset);
  el.xShare?.addEventListener("click", shareSparklerOnX);
})();
