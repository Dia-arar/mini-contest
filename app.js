// ===== util =====
const $ = (sel) => document.querySelector(sel);

// ===== تسجيل =====
if (location.pathname.includes("index.html") || location.pathname.endsWith("/")) {

  $("#registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#username").value.trim();
    const email = $("#email").value.trim();
    if (!name) return alert("أدخل اسمك");
    await auth.signInAnonymously();
    const uid = auth.currentUser.uid;
    await db.collection("players").doc(uid).set({ name, email, created: Date.now() });
    localStorage.setItem("uid", uid);
    localStorage.setItem("name", name); // تخزين الاسم محليًا
    location.href = "quiz.html";
  });
}

// ===== الأسئلة =====
const questions = [
  {
    q: "ما الرقم التالي في السلسلة: 2، 3، 5، 9، 17، ؟",
    opts: ["33", "31", "25", "35"],
    ans: 33
  },
  {
    q: "علي يقف أمام مرآة. يرفع يده اليمنى، فتظهر اليد اليسرى في المرآة. ماذا يرى إن كتب كلمة \"دمّك\"؟",
    opts: ["كما هي", "مقلوبة", "بالعكس", "غير واضحة"],
    ans: "بالعكس"
  },

  {
    q: "في أحد الشهور، كان اليوم الأول ثلاثاء، كم عدد أيام الجمعة في هذا الشهر؟",
    opts: ["4", "5", "3", "2"],
    ans: "5"
  },

   {
    q: "بيت له أربع جهات، وكل جهة تطل على الجنوب. مرّ دب بجانب البيت. ما لونه؟",
    opts: ["أسود", "بني", "رمادي", "أبيض"],
    ans: "أبيض"
  },

  {
  q: "ما هو الشهر الذي يحتوي على 28 يومًا؟",
  opts: ["فبراير", "يناير", "غيرها", "مارس"],
  ans: "غيرها"
},

  {
  q: "إذا كان الصفر يعني لا شيء، فكم عدد الأصفار في الرقم صفر؟",
  opts: ["1", "0", "لا نهائي", "يعتمد على السياق"],
  ans: "1"
},

  {
  q: "في تجربة، سقطت ريشة ومطرقة بنفس اللحظة على القمر. أيهما يصل أولًا؟",
  opts: ["الريشة", "المطرقة", "معًا", "لا يصلان"],
  ans: "معًا"
},

  {
    q: "بدأت في قراءة كتاب من الصفحة 1 إلى 30، كم مرة قلبت الصفحة؟",
    opts: ["29", "30", "15", "31"],
    ans: "29"
  },
  {
  q: "إذا كانت 5 آلات تنتج 5 قطع خلال 5 دقائق، كم آلة تحتاج لإنتاج 100 قطعة في 100 دقيقة؟",
  opts: ["5", "10", "100", "1"],
  ans: "5"
},

  {
  q: "أمامك درج يحتوي على 10 جوارب حمراء و10 زرقاء، كم أقل عدد من الجوارب يجب أن تسحب لتتأكد أن معك زوجًا متطابقًا؟",
  opts: ["2", "3", "10", "21"],
  ans: "3"
}

];

// ===== المسابقة =====
if (location.pathname.endsWith("quiz.html")) {
  const qBox   = $("#quizBox");
  const resBox = $("#resultBox");
  const qText  = $("#question");
  const ansDiv = $("#answers");
  const counter= $("#questionCounter");
  const timer  = $("#timer");

  let idx = 0, score = 0, startTime = Date.now();
  let interval;

  function loadQuestion() {
    console.log("جاري تحميل السؤال والأزرار");
    if (idx >= questions.length) return finish();
    const { q, opts } = questions[idx];
    counter.textContent = `سؤال ${idx + 1} / ${questions.length}`;
    qText.textContent = q;
    ansDiv.innerHTML = "";
    opts.forEach(o => {
  const btn = document.createElement("button");
  btn.className = "bg-[#0f172a] text-[#d1fae5] border border-[#334155] rounded-xl w-full py-3 px-4 mb-3 transition hover:bg-[#1e293b] hover:shadow-lg hover:shadow-green-500/40";
  btn.textContent = o;
  btn.onclick = () => selectAnswer(o);
  ansDiv.appendChild(btn);
});

  }

  function selectAnswer(choice) {
    if (choice === questions[idx].ans) score += 10;
    idx++;
    loadQuestion();
  }

  function tick() {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    timer.textContent = `${secs}s`;
  }

  function finish() {
    clearInterval(interval);
    qBox.hidden = true;
    resBox.hidden = false;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    $("#finalScore").textContent = `درجتك: ${score} / ${questions.length * 10}\nالوقت: ${elapsed} ثانية`;

    // حفظ النتائج مع الاسم بدل uid
    const name = localStorage.getItem("name") || "—";
    db.collection("results").add({ name, score, elapsed, at: Date.now() });
  }

  // init
  auth.onAuthStateChanged(user => {
    if (!user) return location.href = "index.html";
    qBox.hidden = false;
    loadQuestion();
    interval = setInterval(tick, 1000);
  });
}

// ===== لوحة الصدارة =====
if (location.pathname.endsWith("leaderboard.html")) {
  auth.onAuthStateChanged(() => {
    db.collection("results")
      .orderBy("score", "desc")
      .orderBy("elapsed")
      .limit(10)
      .get()
      .then(snap => {
        const body = $("#leaderBody");
        let i = 1;
        snap.forEach(doc => {
          const { name, score, elapsed } = doc.data();
          body.insertAdjacentHTML("beforeend", `
            <tr class='hover:bg-gray-50'>
              <td class='p-2'>${i}</td>
              <td class='p-2 text-right'>${name}</td>
              <td class='p-2'>${score}</td>
              <td class='p-2'>${elapsed}s</td>
            </tr>
          `);
          i++;
        });
      });
  });
}
