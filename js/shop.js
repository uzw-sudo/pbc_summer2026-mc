"use strict";
(() => {
  const QUESTIONS_PATH="../data/questions.json";
  const RESULT_PATH="../result/index.html";
  const $=id=>document.getElementById(id);
  const el={dialogue:$("masterDialogue"),masterImage:$("masterImage"),mobileMasterImage:$("mobileMasterImage"),current:$("questionCurrent"),total:$("questionTotal"),kicker:$("questionKicker"),title:$("questionTitle"),hint:$("questionHint"),answerList:$("answerList"),backButton:$("backButton"),status:$("questionStatus"),orderNumber:$("temporaryOrderNumber"),transition:$("brewingTransition"),brewingMessage:$("brewingMessage")};
  let questions=[],index=0,answers=[],locked=false;
  const format=n=>String(n).padStart(2,"0");
  const MASTER_IMAGES = {
    normal: "../assets/images/master_normal.png",
    gentle: "../assets/images/master_gentle.png",
    annoyed: "../assets/images/master_annoyed.png",
    talk: "../assets/images/master_talk.png",
    mutter: "../assets/images/master_mutter.png",
    grin: "../assets/images/master_grin.png",
    tease: "../assets/images/master_tease.png",
    soft: "../assets/images/master_soft.png",
    pensive: "../assets/images/master_pensive.png",
    happy: "../assets/images/master_happy.png",
    warm: "../assets/images/master_warm.png",
    laugh: "../assets/images/master_laugh.png"
  };
  const DEFAULT_MASTER_IMAGE = MASTER_IMAGES.normal;

  function resolveMasterImage(value) {
    if (!value) return DEFAULT_MASTER_IMAGE;
    return MASTER_IMAGES[value] || value;
  }

  function setMasterImage(source) {
    const targets = [el.masterImage, el.mobileMasterImage].filter(Boolean);
    if (!targets.length) return;

    const nextSource = resolveMasterImage(source);
    if (targets.every(image => image.getAttribute("src") === nextSource)) return;

    targets.forEach(image => image.classList.add("is-changing"));

    const preload = new Image();
    preload.onload = () => {
      targets.forEach(image => {
        image.src = nextSource;
        window.setTimeout(() => {
          image.classList.remove("is-changing");
        }, 30);
      });
    };
    preload.onerror = () => {
      targets.forEach(image => {
        image.src = DEFAULT_MASTER_IMAGE;
        image.classList.remove("is-changing");
      });
    };
    preload.src = nextSource;
  }

  function render(){ const q=questions[index]; if(!q)return; setMasterImage(q.masterExpression || q.masterImage); locked=false; el.current.textContent=format(index+1); el.total.textContent=format(questions.length); el.kicker.textContent=q.kicker||"TONIGHT'S ORDER"; el.title.textContent=q.question||""; el.hint.textContent=q.hint||""; el.backButton.disabled=index===0; el.answerList.replaceChildren(); q.answers.forEach((a,i)=>{const b=document.createElement("button");b.type="button";b.className="answer-option";b.setAttribute("role","radio");b.setAttribute("aria-checked",answers[index]===i?"true":"false");if(answers[index]===i)b.classList.add("is-selected");const main=document.createElement("span");main.className="answer-main";main.textContent=a.label;const sub=document.createElement("span");sub.className="answer-sub";sub.textContent=a.sub||"";b.append(main,sub);b.addEventListener("click",()=>select(i,b));el.answerList.append(b);}); MidnightDialogue.type(el.dialogue,q.dialogue,62); }
  function score(){const s={tired:0,happy:0,quiet:0,energy:0};questions.forEach((q,qi)=>{const a=q.answers?.[answers[qi]];Object.entries(a?.score||{}).forEach(([k,v])=>s[k]=Number(s[k]||0)+Number(v||0));});return s;}
  async function select(answerIndex,button){if(locked)return;locked=true;answers[index]=answerIndex;el.answerList.querySelectorAll(".answer-option").forEach(x=>{x.classList.remove("is-selected");x.setAttribute("aria-checked","false")});button.classList.add("is-selected");button.setAttribute("aria-checked","true");const answer=questions[index].answers[answerIndex];setMasterImage(answer.masterExpression || answer.masterImage || questions[index].replyExpression || questions[index].replyImage || questions[index].masterExpression || questions[index].masterImage);el.status.textContent="注文票へ印をつけました。";const reply=MidnightDialogue.choose(answer.reply,`${MidnightStorage.orderNumber()}:${questions[index].id}`);if(reply)await MidnightDialogue.type(el.dialogue,reply,58);setTimeout(()=>{if(index<questions.length-1){index++;el.status.textContent="";render();}else finish();},520);}
  async function finish(){MidnightStorage.setScore(score());MidnightStorage.setAnswers(answers);localStorage.removeItem(MidnightStorage.KEYS.card);localStorage.removeItem(MidnightStorage.KEYS.variants);el.brewingMessage.textContent="君に合う一杯を、いま淹れているところだぁ。";el.transition.classList.add("is-active");el.transition.setAttribute("aria-hidden","false");setTimeout(()=>{window.MidnightNightSky?.shoot({x:innerWidth*.78,y:innerHeight*.12,speed:14});el.brewingMessage.textContent="お。……願い事しとけよ。";},850);setTimeout(()=>location.href=RESULT_PATH,3300);}
  function back(){if(index===0||locked)return;index--;el.status.textContent="";render();}
  async function init(){el.orderNumber.textContent=MidnightStorage.orderNumber();MidnightStorage.resetDiagnosis();try{const data=await MidnightData.loadJson(QUESTIONS_PATH);questions=data.questions||[];if(!questions.length)throw new Error("質問データがありません。");answers=[];render();}catch(error){console.error(error);el.title.textContent="注文票を開けませんでした。";el.hint.textContent="GitHub Pages または Live Server で開いてください。";}}
  el.backButton?.addEventListener("click",back);document.addEventListener("DOMContentLoaded",init);
})();
