// DailyKal landing page — interactions. No dependencies.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = ms => new Promise(r => setTimeout(r, reduced ? Math.min(ms, 120) : ms));

  // ---------- WhatsApp: every CTA opens a chat with a ready first message ----------
  const WA_TEXT = "היי יסכה, הגעתי מהאתר של DailyKal ואשמח לשמוע איך אפשר להקל על העסק שלי.";
  $$(".js-wa").forEach(a => {
    a.href = `https://wa.me/972554660339?text=${encodeURIComponent(WA_TEXT)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  // ---------- Header border + floating button ----------
  const header = $(".site-header");
  const float = $(".wa-float");
  const hero = $(".hero");
  const onScroll = () => {
    header.classList.toggle("scrolled", scrollY > 8);
    float.classList.add("show");   // the WhatsApp button stays available through the whole page
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- "מוכר לכם?" checklist ----------
  const result = $("#check-result");
  const boxes = $$(".checklist input");
  boxes.forEach(b => b.addEventListener("change", () => {
    const n = boxes.filter(x => x.checked).length;
    result.textContent =
      n === 0 ? "כל שורה כאן היא משימה שיכולה לקרות לבד." :
      n === 1 ? "סימנתם משימה אחת. גם אותה אפשר להעביר לאוטומטי." :
      n === boxes.length ? "סימנתם הכול. בואו נדבר, יש פה הרבה זמן להחזיר לעסק." :
      `סימנתם ${n} משימות. את כולן אפשר להעביר לאוטומטי.`;
  }));

  // ---------- Tabs ----------
  const tabs = $$('[role="tab"]');
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", e => {
      // RTL: ArrowLeft moves forward
      const d = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0;
      if (!d) return;
      const next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus(); select(next);
    });
  });

  // ---------- Demo 1: chat before / after a bot ----------
  const chat = $("#chat");
  const status = $("#bot-status");
  const botStat = $("#bot-stat");
  const scripts = {
    before: {
      status: "נראה לאחרונה ב-07:30",
      stat: "<b>3.5 שעות</b> המתנה לתשובה, והלקוח הלך",
      lines: [
        ["in", "היי, יש לכם תור פנוי השבוע?", "08:12", 700],
        ["sys", "ההודעה מחכה, כולם באמצע עבודה...", "", 1300],
        ["sys", "3 שעות ו-28 דקות אחר כך", "", 1300],
        ["out", "היי! סליחה על העיכוב, מה מתאים לך?", "11:40", 1100],
        ["in", "תודה, כבר קבעתי במקום אחר 🙁", "11:52", 1400],
      ],
    },
    after: {
      status: "מחובר",
      stat: "<b>0 דקות</b> המתנה לתשובה",
      lines: [
        ["in", "היי, יש לכם תור פנוי השבוע?", "08:12", 700],
        ["typing", "", "", 1100],
        ["bot", "בוקר טוב! ☀️ יש תור ביום שלישי ב-10:00 או ברביעי ב-16:30. מה מתאים?", "08:12", 1500],
        ["in", "שלישי ב-10 מעולה", "08:13", 1100],
        ["typing", "", "", 900],
        ["bot", "קבעתי! ✔ תזכורת תישלח יום לפני. מחכים לך.", "08:13", 1000],
      ],
    },
  };
  let mode = "after";
  let run = 0;
  const bubble = (kind, text, time) => {
    const li = document.createElement("li");
    li.className = `msg ${kind === "bot" ? "out bot" : kind}`;
    if (kind === "typing") li.innerHTML = "<i></i><i></i><i></i>";
    else li.innerHTML = `${text}${time ? `<time>${time}</time>` : ""}`;
    chat.append(li);
    return li;
  };
  async function playChat() {
    const id = ++run;
    const s = scripts[mode];
    chat.innerHTML = "";
    status.textContent = s.status;
    botStat.innerHTML = s.stat;
    for (const [kind, text, time, delay] of s.lines) {
      await wait(delay);
      if (id !== run) return;
      if (kind === "typing") {
        const t = bubble("typing");
        await wait(900);
        t.remove();
        if (id !== run) return;
      } else bubble(kind, text, time);
    }
  }
  $$(".switch button").forEach(b => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    $$(".switch button").forEach(x => x.setAttribute("aria-checked", x === b));
    playChat();
  }));
  $("#chat-replay").addEventListener("click", playChat);

  // ---------- Demo 2: automation flow ----------
  const flow = $("#flow");
  const nodes = $$(".node", flow);
  const flowStat = $("#flow-stat");
  let flowRun = 0;
  async function playFlow() {
    const id = ++flowRun;
    nodes.forEach(n => n.classList.remove("on"));
    flow.style.setProperty("--p", 0);
    flowStat.innerHTML = "4 פעולות · <b>0</b> העתק-הדבק";
    for (let i = 0; i < nodes.length; i++) {
      await wait(i === 0 ? 300 : 850);
      if (id !== flowRun) return;
      nodes[i].classList.add("on");
      flow.style.setProperty("--p", i / (nodes.length - 1));
    }
    flowStat.innerHTML = "הכול קרה תוך <b>58 שניות</b>, בלי לגעת";
  }
  $("#flow-run").addEventListener("click", playFlow);

  // ---------- Demo 3: reminders ----------
  const items = $$("#agenda em");
  const remindStat = $("#remind-stat");
  let remindRun = 0;
  async function playRemind() {
    const id = ++remindRun;
    items.forEach(e => { e.className = ""; e.textContent = ""; });
    remindStat.innerHTML = "תזכורות שנשלחו: <b>0</b> מתוך 5";
    for (let i = 0; i < items.length; i++) {
      await wait(450);
      if (id !== remindRun) return;
      items[i].className = "sent";
      items[i].textContent = "נשלחה תזכורת";
      remindStat.innerHTML = `תזכורות שנשלחו: <b>${i + 1}</b> מתוך 5`;
    }
    for (const i of [0, 2, 3, 1, 4]) {
      await wait(500);
      if (id !== remindRun) return;
      items[i].className = "ok";
      items[i].textContent = i === 4 ? "בקשה לשינוי מועד" : "✔ הגעה אושרה";
    }
    remindStat.innerHTML = "5 תזכורות · <b>0 דקות</b> של טלפונים";
  }
  $("#remind-run").addEventListener("click", playRemind);

  // Auto-play each demo the first time it is opened and visible
  const played = new Set();
  const autoplay = { "panel-bot": playChat, "panel-flow": playFlow, "panel-remind": playRemind };
  const tryAutoplay = () => {
    const open = $$(".panel").find(p => !p.hidden);
    if (!open || played.has(open.id)) return;
    const r = open.getBoundingClientRect();
    if (r.top < innerHeight * 0.75 && r.bottom > 0) { played.add(open.id); autoplay[open.id](); }
  };
  addEventListener("scroll", tryAutoplay, { passive: true });
  tabs.forEach(t => t.addEventListener("click", () => setTimeout(tryAutoplay, 50)));
  tryAutoplay();

  // ---------- Time calculator ----------
  const times = $("#c-times"), mins = $("#c-mins");
  const fmt = n => (Math.round(n * 10) / 10).toLocaleString("he-IL");
  const calc = () => {
    const hours = times.value * mins.value * 22 / 60;
    $("#o-times").textContent = times.value;
    // minutes shown as a digital clock (mm:00)
    $("#o-mins .mm").textContent = String(mins.value).padStart(2, "0");
    $("#o-mins").setAttribute("aria-label", `${mins.value} דקות`);
    $("#o-hours").textContent = fmt(hours);
    $("#o-days").textContent = fmt(hours / 8);
  };
  times.addEventListener("input", calc);
  mins.addEventListener("input", calc);
  calc();

  // ---------- Pointing-hand hints: show where to click, disappear after the first try ----------
  const hintGone = sel => { const h = $(sel); if (h) h.classList.add("gone"); };
  $$(".switch button").forEach(b => b.addEventListener("click", () => hintGone(".switch .hint-hand")));
  [times, mins].forEach(r => r.addEventListener("input", () => hintGone("#times-wrap .hint-hand")));
  // park the slider hand on the thumb (range inputs run right-to-left on this page)
  const placeSliderHand = () => {
    const h = $("#times-wrap .hint-hand"); if (!h) return;
    const frac = (times.value - times.min) / (times.max - times.min), w = times.offsetWidth, thumb = 22;
    h.style.left = `${(1 - frac) * (w - thumb) + thumb / 2}px`;
  };
  placeSliderHand();
  addEventListener("resize", placeSliderHand);

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$(".reveal").forEach(el => io.observe(el));

  $("#year").textContent = new Date().getFullYear();
})();
