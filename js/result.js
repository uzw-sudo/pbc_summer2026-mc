"use strict";
(() => {
  const DATA_PATH="../data/coffee.json";
  const $=id=>document.getElementById(id);
  const el={card:$("resultCard"),paper:document.querySelector(".card-paper"),stain:document.querySelector(".coffee-stain"),frame:document.querySelector(".card-frame"),coffeeName:$("coffeeName"),coffeeSubtitle:$("coffeeSubtitle"),constellationName:$("constellationName"),constellationText:$("constellationText"),diagnosis:$("diagnosis"),masterComment:$("masterComment"),dessert:$("dessert"),luckyItem:$("luckyItem"),orderNumber:$("orderNumber"),moonNumber:$("moonNumber"),xShareButton:$("xShareButton"),copyResultButton:$("copyResultButton"),shareStatus:$("shareStatus")};
  let current=null,resizeTimer=0;
  function text(node,value,fallback="―"){if(node)node.textContent=String(value??"").trim()||fallback;}
  function image(node,path,fallback){if(!node)return;node.onerror=()=>{node.onerror=null;if(fallback)node.src=fallback;};node.src=path||fallback;}
  function metadata(id){const order=MidnightStorage.orderNumber();const digits=String(id||"M-001").replace(/\D/g,"").padStart(3,"0");text(el.orderNumber,order);text(el.moonNumber,`M-${digits}${order.slice(-3)}`);}
  function canvases(){if(!current)return;window.renderFlavorChart?.(current);window.renderConstellation?.(current);}
  function presentation(card) {
  const p = card.presentation || {};
  const rarity = String(card.rarity || "normal").toLowerCase();
  const isSpecial = ["rare", "full_moon", "secret"].includes(rarity);

  /* 紙 */
  image(
    el.paper,
    p.paper,
    "../assets/images/card-paper.png"
  );

  /* 専用カード画像には染み・通常枠を重ねない */
  if (isSpecial) {

    if (el.stain) {
      el.stain.removeAttribute("src");
      el.stain.style.display = "none";
    }

    if (el.frame) {
      el.frame.removeAttribute("src");
      el.frame.style.display = "none";
    }

  } else {

    /* 通常カードでは今まで通り */
    if (el.stain) {
      el.stain.style.display = "";
      image(
        el.stain,
        p.stain,
        "../assets/images/coffee-stain.png"
      );
    }

    if (el.frame) {
      el.frame.style.display = "";
      image(
        el.frame,
        p.frame,
        "../assets/images/frame.png"
      );
    }
  }

  if (el.card) {
    el.card.dataset.rarity =
      rarity;

    el.card.dataset.effect =
      p.effect || "none";

    el.card.classList.remove("is-ready");

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.card.classList.add("is-ready");

        if (rarity === "secret") {
          setTimeout(
            () => window.MidnightNightSky?.burst(3, 230),
            420
          );
        } else if (rarity === "full_moon") {
          setTimeout(
            () => {
              window.MidnightNightSky?.shoot();
              window.MidnightNightSky?.burst?.(2, 180);
            },
            480
          );
        } else if (rarity === "rare") {
          setTimeout(
            () => window.MidnightNightSky?.shoot(),
            520
          );
        }
      })
    );
  }
}
  function render(card){current=card;const c=card.coffee||{},star=card.constellation||{};text(el.coffeeName,c.name);text(el.coffeeSubtitle,c.subtitle);text(el.constellationName,star.name);text(el.constellationText,star.text);text(el.diagnosis,card.diagnosisText);text(el.masterComment,card.masterComment);text(el.dessert,card.dessert);text(el.luckyItem,card.luckyItem);metadata(card.id);presentation(card);document.title=c.name?`${c.name}｜真夜中珈琲屋台`:"診断結果｜真夜中珈琲屋台";requestAnimationFrame(canvases);}
  const SHARE_ENTRY_URL = "https://uzw-sudo.github.io/pbc_summer2026-mc/";

  function shareText(){
    const name=el.coffeeName?.textContent?.trim()||"今夜の一杯";
    const rarity=String(current?.rarity||"normal").toLowerCase();
    let lead="真夜中珈琲屋台で、\n今夜の私に出された一杯は──";
    if(rarity==="full_moon") lead="真夜中珈琲屋台で、\n今夜だけの特別な一杯が出ました──";
    if(rarity==="secret") lead="真夜中珈琲屋台で、\n見たことのない一杯が出ました──";
    return `${lead}\n\n☕「${name}」\n\n今夜、あなたに出される一杯は？\n\n#真夜中珈琲屋台 #今夜の一杯 #PBT夏祭り2026`;
  }

  function shareOnX(){
    const url=`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText())}&url=${encodeURIComponent(SHARE_ENTRY_URL)}`;
    window.open(url,"_blank","noopener,noreferrer");
    text(el.shareStatus,"Xの投稿画面を開きました。","");
  }

  async function copyResult(){
    const value=`${shareText()}\n${SHARE_ENTRY_URL}`;
    try{
      await navigator.clipboard.writeText(value);
      text(el.shareStatus,"結果をコピーしました ☕","");
    }catch(e){
      const area=document.createElement("textarea");
      area.value=value;
      area.setAttribute("readonly","");
      area.style.position="fixed";
      area.style.opacity="0";
      document.body.appendChild(area);
      area.select();
      const ok=document.execCommand("copy");
      area.remove();
      text(el.shareStatus,ok?"結果をコピーしました ☕":"コピーできませんでした。","");
    }
  }

  async function init(){
  try{
    const cards=await MidnightData.loadJson(DATA_PATH);

    const stored=MidnightStorage.getCardId();
    const answers=MidnightStorage.getAnswers?.() || [];

    // デバッグ用: ?result=M-015 のように指定すると、そのカードを直接表示できます。
    const requestedId = new URLSearchParams(location.search).get("result");
    const debugForcedId = requestedId && cards.some(c => c.id === requestedId)
      ? requestedId
      : null;

    /*
      ========================================
      SECRET ROUTE
      M-030「店主の気まぐれ」
      ========================================
      
      q1 少し、疲れてしまった       → 0
      q2 賑やかな灯りの近く         → 3
      q3 姿の見えない新月           → 2
      q4 ぬるく穏やか               → 1
      q5 疲れていること             → 0
      q6 小さな幸運がほしい         → 2
      q7 始める強さ                 → 3
    */

    const secretRoute = [0, 3, 2, 1, 0, 2, 3];

    const isSecretRoute =
      answers.length === secretRoute.length &&
      answers.every(
        (answer, index) => answer === secretRoute[index]
      );

    const forced =
      debugForcedId
        ? debugForcedId
        : isSecretRoute
          ? "M-030"
          : stored && cards.find(c => c.id === stored)
            ? stored
            : null;

    const chosen=MidnightCardEngine.select(
      cards,
      MidnightStorage.getScore(),
      {
        forcedId:forced,
        orderNumber:MidnightStorage.orderNumber()
      }
    );

    MidnightStorage.setCardId(chosen.id);

    const resolved=MidnightCardEngine.resolve(
      chosen,
      MidnightStorage.getVariants()
    );

    MidnightStorage.setVariants(resolved.variants);

    render(resolved.card);

  }catch(e){
    console.error(e);

    text(
      el.coffeeName,
      "今夜は準備中です"
    );

    text(
      el.coffeeSubtitle,
      "データを読み込めませんでした。GitHub Pages または Live Server で開いてください。"
    );
  }
}
  el.xShareButton?.addEventListener("click",shareOnX);el.copyResultButton?.addEventListener("click",copyResult);window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(canvases,120)},{passive:true});document.addEventListener("DOMContentLoaded",init);
})();
/* ========================================
   もう一杯注文する
======================================== */

const orderAgainButton =
  document.getElementById("orderAgainButton");

if (orderAgainButton) {
  orderAgainButton.addEventListener(
    "click",
    () => {
      // 「もう一杯」は新しい注文として扱い、抽選用の注文番号も更新する。
      MidnightStorage.resetOrderNumber?.();
      MidnightStorage.resetDiagnosis?.();
      window.location.href = "../menu/index.html";
    }
  );
}