"use strict";
(() => {
  const KEYS = { score:"playerScore", answers:"midnightAnswers", card:"selectedCardId", variants:"midnightCardVariants", order:"midnightCoffeeOrderNumber" };
  function parse(storage,key,fallback=null){ try { const v=storage.getItem(key); return v===null?fallback:JSON.parse(v); } catch { return fallback; } }
  function set(storage,key,value){ try { storage.setItem(key,JSON.stringify(value)); return true; } catch { return false; } }
  function orderNumber(){ let n=sessionStorage.getItem(KEYS.order); if(!n){ n=String(Math.floor(100000+Math.random()*900000)); sessionStorage.setItem(KEYS.order,n); } return n; }
  function resetDiagnosis(){ [KEYS.score,KEYS.answers,KEYS.card,KEYS.variants].forEach(k=>localStorage.removeItem(k)); }
  function resetOrderNumber(){ sessionStorage.removeItem(KEYS.order); }
  window.MidnightStorage={ KEYS, getScore:()=>parse(localStorage,KEYS.score,{}), setScore:v=>set(localStorage,KEYS.score,v), getAnswers:()=>parse(localStorage,KEYS.answers,[]), setAnswers:v=>set(localStorage,KEYS.answers,v), getCardId:()=>localStorage.getItem(KEYS.card), setCardId:v=>localStorage.setItem(KEYS.card,String(v||"")), getVariants:()=>parse(localStorage,KEYS.variants,{}), setVariants:v=>set(localStorage,KEYS.variants,v), orderNumber, resetDiagnosis, resetOrderNumber };
})();
