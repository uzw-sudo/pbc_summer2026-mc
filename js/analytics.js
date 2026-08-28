"use strict";

/* =========================================================
   真夜中珈琲屋台 - Google Analytics 4
   Measurement ID: G-D741YLEYBC

   プライバシー方針:
   - 名前・メールアドレス等の個人情報は送信しません。
   - テイクアウトカードに入力された guestName は計測対象外です。
   - 診断結果・レアリティ・ボタン操作など、屋台内の匿名イベントだけを送信します。
========================================================= */
(() => {
  const MEASUREMENT_ID = "G-D741YLEYBC";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    send_page_view: true
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  function cleanParams(params = {}) {
    const cleaned = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (typeof value === "string") cleaned[key] = value.slice(0, 100);
      else if (["number", "boolean"].includes(typeof value)) cleaned[key] = value;
    });
    return cleaned;
  }

  function track(eventName, params = {}) {
    if (!eventName) return;
    window.gtag("event", eventName, cleanParams(params));
  }

  function trackOnce(uniqueKey, eventName, params = {}) {
    if (!uniqueKey) {
      track(eventName, params);
      return true;
    }
    const storageKey = `midnightCoffee.ga4.once.${uniqueKey}`;
    try {
      if (sessionStorage.getItem(storageKey)) return false;
      sessionStorage.setItem(storageKey, "1");
    } catch (_) {}
    track(eventName, params);
    return true;
  }

  window.MidnightAnalytics = Object.freeze({
    measurementId: MEASUREMENT_ID,
    track,
    trackOnce
  });
})();
