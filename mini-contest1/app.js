// ===== util =====
const $ = (sel) => document.querySelector(sel);

// ===== تسجيل =====
if (location.pathname.endsWith("index.html") || location.pathname === "/") {
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
    //____________________________
    location.href = "mini-contest/quiz.html";
    //location.href = "quiz.html";
  });
}

// ===== الأسئلة =====
const questions = [
  {
    q: "يملك أحمد ثلاث أخوات، كل أخت لديها أخ واحد فقط. كم عدد أفراد العائلة (الأشقاء)؟",
    opts: ["2", "3", "4", "5"],
    ans: 4
  },
  {
    q: "إذا كان الكاذب يكذب يوم الأحد فقط، وقال يوم الأحد: \"أنا أكذب اليوم\"، هل هو صادق أم كاذب؟",
    opts: ["صادق", "كاذب"],
    ans: "كاذب"
  },
  {
    q: "ثلاثة أصدقاء (سارة، ماجد، عمر) جلسوا بالترتيب حول دائرة. سارة ليست بجانب ماجد. من يجلس بينهما؟",
    opts: ["سارة", "عمر", "ماجد", "لا أحد"],
    ans: "عمر"
  },
  {
    q: "في سباق، تجاوزت الشخص الثاني. في أي مركز أصبحت الآن؟",
    opts: ["الأول", "الثاني", "الثالث", "الأخير"],
    ans: "الثاني"
  },
  {
    q: "لغز الساعة: عقرب الساعات بين الـ 4 والـ 5، وعقرب الدقائق على الـ 12. كم الوقت؟",
    opts: ["4:00", "4:20", "5:00", "4:59"],
    ans: "4:00"
  },
  {
    q: "إذا كان 2×X = X²، و X ≠ 0، فما قيمة X؟",
    opts: ["0", "1", "2", "-2"],
    ans: "2"
  },
  {
    q: "أمامك ثلاثة صناديق: تفاح، برتقال، خليط. كل صندوق مُسمّى خطأ. مسموح لك تسحب حبة واحدة من صندوق واحد. أي صندوق تختار؟",
    opts: ["التفاح", "البرتقال", "الخليط"],
    ans: "الخليط"
  },
  {
    q: "بدأت في قراءة كتاب من الصفحة 1 إلى 30، كم مرة قلبت الصفحة؟",
    opts: ["29", "30", "15", "31"],
    ans: "29"
  },
  {
    q: "قطار طوله 100م يمر عبر نفق طوله 100م بسرعة ثابتة. يستغرق 20 ثانية ليخرج كليًا. كم سرعة القطار؟ (م/ث)",
    opts: ["5", "10", "15", "20"],
    ans: "10"
  },
  {
    q: "أحمد يكذب أيام الإثنين والثلاثاء؛ ويصدق باقي الأسبوع. قال يوم الأربعاء: \"كذبت أمس\". هل تصريحه صحيح؟",
    opts: ["نعم", "لا"],
    ans: "نعم"
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
    if (idx >= questions.length) return finish();
    const { q, opts } = questions[idx];
    counter.textContent = `سؤال ${idx + 1} / ${questions.length}`;
    qText.textContent = q;
    ansDiv.innerHTML = "";
    opts.forEach(o => {
      const btn = document.createElement("button");
      btn.className = "btn w-full mb-2";
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