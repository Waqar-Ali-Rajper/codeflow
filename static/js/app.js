/* ============================================================
   CODEFLOW — FRONTEND ENGINE
   Particle BG | Pipeline | API Calls | Animations
   ============================================================ */

// ============================================================
// PARTICLE BACKGROUND SYSTEM
// ============================================================
(function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.05;
            this.hue = Math.random() > 0.7 ? 195 : 238; // cyan or indigo-ish
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles
    const count = Math.floor((canvas.width * canvas.height) / 14000);
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function connectLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.strokeStyle = `hsla(195, 80%, 60%, ${0.06 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectLines();
        animId = requestAnimationFrame(loop);
    }
    loop();
})();

// ============================================================
// LINE NUMBERS
// ============================================================
function updateLineNumbers() {
    const editor = document.getElementById("code-input");
    const lines = editor.value.split("\n");
    const nums = lines.map((_, i) => i + 1).join("\n");
    document.getElementById("lineNumbers").textContent = nums;
}

document.getElementById("code-input").addEventListener("scroll", function () {
    document.getElementById("lineNumbers").scrollTop = this.scrollTop;
});

// ============================================================
// GLOBALS
// ============================================================
let currentBugs = [];
let currentFixedCode = "";
let currentTestCode = "";

// ============================================================
// LOADING
// ============================================================
function showLoading(msg = "Analyzing...") {
    document.getElementById("loading-text").textContent = msg;
    document.getElementById("loading-overlay").classList.remove("hidden");
}
function hideLoading() {
    document.getElementById("loading-overlay").classList.add("hidden");
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, icon = "✅", duration = 2400) {
    const t = document.getElementById("toast");
    document.getElementById("toast-text").textContent = msg;
    document.getElementById("toast-icon").textContent = icon;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), duration);
}

// ============================================================
// PIPELINE STEP INDICATOR
// ============================================================
function setStep(stepId) {
    document.querySelectorAll(".step").forEach(s => {
        s.classList.remove("active", "done");
    });
    const order = ["step-analyze", "step-fix", "step-test", "step-verify"];
    const idx = order.indexOf(stepId);
    order.forEach((id, i) => {
        const el = document.getElementById(id);
        if (i < idx) el.classList.add("done");
        else if (i === idx) el.classList.add("active");
    });
}

// ============================================================
// CLEAR
// ============================================================
function clearAll() {
    document.getElementById("code-input").value = "";
    updateLineNumbers();
    currentBugs = [];
    currentFixedCode = "";
    currentTestCode = "";

    document.getElementById("bugs-container").innerHTML = `
        <div class="empty-state">
            <div class="empty-visual"><div class="empty-circles"><div class="ec ec-1"></div><div class="ec ec-2"></div><div class="ec ec-3"></div></div></div>
            <p class="empty-title">Ready to Analyze</p>
            <p class="empty-desc">Paste your code and click Analyze<br/>to find bugs instantly with Gemini 3</p>
        </div>`;

    document.getElementById("summary-cards").classList.add("hidden");
    document.getElementById("action-buttons").classList.add("hidden");
    document.getElementById("fixed-panel").classList.add("hidden");
    document.getElementById("tests-panel").classList.add("hidden");
    document.getElementById("quality-badge").classList.add("hidden");
    document.getElementById("bugs-badge").classList.add("hidden");
    setStep("step-analyze");
    showToast("Everything cleared", "🗑️");
}

// ============================================================
// KEYBOARD SHORTCUT: Ctrl+Enter → Analyze
// ============================================================
document.getElementById("code-input").addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        analyzeCode();
    }
    // Tab key → insert spaces
    if (e.key === "Tab") {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
        updateLineNumbers();
    }
});

// ============================================================
// STEP 1: ANALYZE
// ============================================================
async function analyzeCode() {
    const code = document.getElementById("code-input").value.trim();
    const language = document.getElementById("language-select").value;

    if (!code) { showToast("Paste your code first!", "⚠️"); return; }

    setStep("step-analyze");
    showLoading("🔍 Gemini 3 is deeply analyzing your code...");

    try {
        const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language })
        });
        const data = await res.json();
        hideLoading();

        if (data.error) { showToast(data.error, "❌"); return; }

        currentBugs = data.bugs;
        renderBugs(currentBugs);

    } catch (e) {
        hideLoading();
        showToast("Server connection failed. Try again.", "❌");
        console.error(e);
    }
}

// ============================================================
// RENDER BUGS
// ============================================================
function renderBugs(bugs) {
    const container = document.getElementById("bugs-container");
    const badge = document.getElementById("bugs-badge");

    if (!bugs || bugs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-visual"><div class="empty-circles"><div class="ec ec-1" style="background:var(--green-dim)"></div><div class="ec ec-2" style="background:var(--green);height:36px"></div><div class="ec ec-3" style="background:var(--green-dim)"></div></div></div>
                <p class="empty-title" style="color:var(--green)">✓ Code is Clean!</p>
                <p class="empty-desc">No bugs, vulnerabilities, or issues found.</p>
            </div>`;
        document.getElementById("summary-cards").classList.add("hidden");
        document.getElementById("action-buttons").classList.add("hidden");
        badge.classList.add("hidden");
        showToast("Your code is clean!", "🎉");
        return;
    }

    // Badge
    badge.textContent = bugs.length;
    badge.classList.remove("hidden");

    // Summary counts
    const c = { critical: 0, high: 0, medium: 0, low: 0 };
    bugs.forEach(b => { if (c.hasOwnProperty(b.severity)) c[b.severity]++; });
    document.getElementById("count-critical").textContent = c.critical;
    document.getElementById("count-high").textContent = c.high;
    document.getElementById("count-medium").textContent = c.medium;
    document.getElementById("count-low").textContent = c.low;
    document.getElementById("summary-cards").classList.remove("hidden");

    // Render cards
    container.innerHTML = bugs.map((bug, i) => `
        <div class="bug-card" id="bug-${i}">
            <div class="bug-header" onclick="toggleBug(${i})">
                <span class="bug-sev sev-${bug.severity}">${bug.severity}</span>
                <span class="bug-title">${esc(bug.title)}</span>
                <span class="bug-line">L${bug.line}</span>
                <span class="bug-arrow">▶</span>
            </div>
            <div class="bug-details">
                <div class="bug-details-inner">
                    <div class="dl">📝 Description</div>
                    <div class="dt">${esc(bug.description)}</div>
                    <div class="dl">🔴 Original Code</div>
                    <div class="code-snip orig">${esc(bug.original_code)}</div>
                    <div class="dl">🟢 Fixed Code</div>
                    <div class="code-snip fixed">${esc(bug.fixed_code)}</div>
                    <div class="dl">💡 Explanation</div>
                    <div class="dt">${esc(bug.explanation)}</div>
                </div>
            </div>
        </div>
    `).join("");

    // Stagger animations
    document.querySelectorAll(".bug-card").forEach((card, i) => {
        card.style.animationDelay = `${i * 0.06}s`;
    });

    // Show action buttons
    document.getElementById("action-buttons").classList.remove("hidden");
    showToast(`Found ${bugs.length} issue${bugs.length > 1 ? "s" : ""}`, "🐛");
}

function toggleBug(i) {
    document.getElementById(`bug-${i}`).classList.toggle("expanded");
}

// ============================================================
// STEP 2: FIX
// ============================================================
async function fixCode() {
    const code = document.getElementById("code-input").value.trim();
    const language = document.getElementById("language-select").value;
    if (!code || !currentBugs.length) { showToast("Analyze first!", "⚠️"); return; }

    setStep("step-fix");
    showLoading("🔧 Gemini 3 is fixing all bugs...");

    try {
        const res = await fetch("/api/fix", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language, bugs: currentBugs })
        });
        const data = await res.json();
        hideLoading();

        if (data.error) { showToast(data.error, "❌"); return; }

        currentFixedCode = data.fixed_code;
        document.getElementById("fixed-code-display").textContent = currentFixedCode;
        document.getElementById("fixed-panel").classList.remove("hidden");
        document.getElementById("verify-result").classList.add("hidden");
        document.getElementById("fixed-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
        showToast("All bugs fixed!", "✅");

    } catch (e) {
        hideLoading();
        showToast("Fix failed. Try again.", "❌");
    }
}

// ============================================================
// USE FIXED CODE (paste back into editor)
// ============================================================
function useFixedCode() {
    if (!currentFixedCode) return;
    document.getElementById("code-input").value = currentFixedCode;
    updateLineNumbers();
    showToast("Fixed code loaded into editor!", "⬅️");
}

// ============================================================
// STEP 3: GENERATE TESTS
// ============================================================
async function generateTests() {
    const code = document.getElementById("code-input").value.trim();
    const language = document.getElementById("language-select").value;
    if (!code) { showToast("Paste code first!", "⚠️"); return; }

    setStep("step-test");
    showLoading("🧪 Gemini 3 is generating test cases...");

    try {
        const res = await fetch("/api/generate-tests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language })
        });
        const data = await res.json();
        hideLoading();

        if (data.error) { showToast(data.error, "❌"); return; }

        currentTestCode = data.test_code || "";
        renderTests(data.test_cases || [], currentTestCode);

    } catch (e) {
        hideLoading();
        showToast("Test generation failed.", "❌");
    }
}

function renderTests(cases, code) {
    const catMap = {
        happy_path: { label: "✓ Happy Path", cls: "happy" },
        edge_case: { label: "⚡ Edge Case", cls: "edge" },
        error_case: { label: "✕ Error Case", cls: "error" },
        security: { label: "🔒 Security", cls: "security" }
    };

    document.getElementById("test-tags").innerHTML = cases.map(tc => {
        const c = catMap[tc.category] || { label: tc.category, cls: "happy" };
        return `<span class="test-tag ${c.cls}" title="${esc(tc.description)}">${c.label}: ${esc(tc.name)}</span>`;
    }).join("");

    document.getElementById("test-code-display").textContent = code;
    document.getElementById("tests-panel").classList.remove("hidden");
    document.getElementById("tests-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    showToast(`${cases.length} test cases generated`, "🧪");
}

// ============================================================
// STEP 4: VERIFY
// ============================================================
async function verifyCode() {
    const language = document.getElementById("language-select").value;
    if (!currentFixedCode) { showToast("Fix code first!", "⚠️"); return; }

    setStep("step-verify");
    showLoading("🛡️ Verifying fixed code...");

    try {
        const res = await fetch("/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: currentFixedCode, language })
        });
        const data = await res.json();
        hideLoading();

        if (data.error) { showToast(data.error, "❌"); return; }

        renderVerify(data);

    } catch (e) {
        hideLoading();
        showToast("Verification failed.", "❌");
    }
}

function renderVerify(data) {
    const box = document.getElementById("verify-result");
    box.classList.remove("hidden");

    if (data.is_clean) {
        box.className = "verify-box clean";
        box.innerHTML = `<div class="vb-title">🎉 Code is Clean!</div><div class="vb-desc">${esc(data.summary)}</div>`;
        showToast("Code verified clean!", "🛡️");
    } else {
        box.className = "verify-box issues";
        const issues = (data.remaining_issues || []).map(i => `• <strong>${esc(i.title)}</strong> — ${esc(i.description)}`).join("<br/>");
        box.innerHTML = `<div class="vb-title">⚠️ Remaining Issues</div><div class="vb-desc">${issues || esc(data.summary)}</div>`;
        showToast("Some issues remain", "⚠️");
    }

    // Quality ring animation
    if (data.quality_score !== undefined) {
        const score = data.quality_score;
        document.getElementById("quality-score-val").textContent = score;
        document.getElementById("quality-badge").classList.remove("hidden");

        const circumference = 94.2;
        const offset = circumference - (score / 100) * circumference;
        const ring = document.getElementById("quality-ring-fill");
        ring.style.strokeDashoffset = offset;

        // Color based on score
        if (score >= 80) ring.style.stroke = "var(--green)";
        else if (score >= 50) ring.style.stroke = "var(--amber)";
        else ring.style.stroke = "var(--red)";

        // Animate
        ring.style.transition = "stroke-dashoffset 1s ease, stroke 0.4s";
    }
}

// ============================================================
// COPY
// ============================================================
function copyFixedCode() {
    if (!currentFixedCode) { showToast("Nothing to copy", "⚠️"); return; }
    navigator.clipboard.writeText(currentFixedCode).then(() => showToast("Fixed code copied!", "📋"));
}
function copyTestCode() {
    if (!currentTestCode) { showToast("Nothing to copy", "⚠️"); return; }
    navigator.clipboard.writeText(currentTestCode).then(() => showToast("Test code copied!", "📋"));
}

// ============================================================
// HTML ESCAPE
// ============================================================
function esc(text) {
    if (!text) return "";
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(String(text)));
    return d.innerHTML;
}