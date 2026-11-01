/* =========================================================
   CampusHire - Student Placement Portal
   Sections: 1 Data | 2 Helpers | 3 Display + Filters |
             4 Form validation | 5 Applications | 6 FAQ | 7 Menu
   ========================================================= */

/* ---------- 1. DATA (array of objects) ----------
   "deadlineIn" = days from today, so deadlines never go stale. */
const ALL = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil"];
const companies = [
  { id: 1, name: "TechNova Solutions", role: "Software Developer", location: "Bengaluru", salary: 8.5, minCgpa: 7.5, branches: ["CSE", "IT"], skills: ["Java", "DSA", "SQL"], deadlineIn: 6 },
  { id: 2, name: "InfraBuild Ltd", role: "Site Engineer", location: "Pune", salary: 4.5, minCgpa: 6.0, branches: ["Civil", "Mechanical"], skills: ["AutoCAD", "Estimation"], deadlineIn: 12 },
  { id: 3, name: "DataWave Analytics", role: "Data Analyst", location: "Hyderabad", salary: 6.5, minCgpa: 7.0, branches: ["CSE", "IT", "ECE"], skills: ["Python", "Excel", "Statistics"], deadlineIn: 3 },
  { id: 4, name: "VoltEdge Power", role: "Graduate Engineer Trainee", location: "Noida", salary: 5.0, minCgpa: 6.5, branches: ["EEE", "ECE"], skills: ["Circuits", "PLC"], deadlineIn: 18 },
  { id: 5, name: "CloudNest Systems", role: "Cloud Support Engineer", location: "Chennai", salary: 7.0, minCgpa: 7.0, branches: ["CSE", "IT", "ECE"], skills: ["Linux", "Networking", "AWS"], deadlineIn: 9 },
  { id: 6, name: "AutoMotion Motors", role: "Design Engineer", location: "Pune", salary: 6.0, minCgpa: 6.5, branches: ["Mechanical", "EEE"], skills: ["CAD", "Thermodynamics"], deadlineIn: 15 },
  { id: 7, name: "GlobalServe BPO", role: "Associate Consultant", location: "Gurugram", salary: 3.6, minCgpa: 5.5, branches: ALL, skills: ["Communication", "MS Office"], deadlineIn: 25 },
  { id: 8, name: "PixelForge Studios", role: "Frontend Developer", location: "Remote", salary: 9.0, minCgpa: 8.0, branches: ["CSE", "IT"], skills: ["HTML", "CSS", "JavaScript"], deadlineIn: -3 }
];

const faqs = [
  ["Who can apply for a drive?", "You can apply if your CGPA is equal to or higher than the minimum CGPA, your branch is listed for that drive and the deadline has not passed."],
  ["Can I apply to more than one company?", "Yes. You can apply to as many eligible companies as you like, but only once per company."],
  ["What does LPA mean?", "LPA means Lakhs Per Annum. A package of 6.5 LPA is Rs. 6,50,000 per year."],
  ["Where can I see my applications?", "Open the My Applications section. Every application you submit is listed there with its application ID."],
  ["What if the deadline has passed?", "Closed drives are marked and their Apply button is disabled. Contact the placement cell for special cases."]
];

/* ---------- 2. HELPERS ---------- */
const $ = (id) => document.getElementById(id);

// Today at 00:00 so day calculations are clean
const today = new Date();
today.setHours(0, 0, 0, 0);

companies.forEach((c) => {
  c.deadline = new Date(today.getTime() + c.deadlineIn * 86400000);
  c.daysLeft = c.deadlineIn; // deadline minus today, in days
});

function fmtDate(d) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Escape text so user input can never inject HTML
function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function deadlineBadge(c) {
  if (c.daysLeft < 0) return '<span class="badge closed">Closed</span>';
  if (c.daysLeft === 0) return '<span class="badge soon">Last day today</span>';
  if (c.daysLeft <= 5) return `<span class="badge soon">${c.daysLeft} days left</span>`;
  return `<span class="badge ok">${c.daysLeft} days left</span>`;
}

// Why is the student not eligible? Returns "" if eligible.
function eligibilityProblem(c, cgpa, branch) {
  if (c.daysLeft < 0) return "The deadline for this drive has passed.";
  if (branch && !c.branches.includes(branch)) return `${branch} is not an eligible branch (allowed: ${c.branches.join(", ")}).`;
  if (cgpa !== "" && cgpa < c.minCgpa) return `Your CGPA ${cgpa} is below the minimum ${c.minCgpa}.`;
  return "";
}

/* ---------- 3. DISPLAY + FILTERS ---------- */
let view = "cards";

function getFiltered() {
  const q = $("fSearch").value.trim().toLowerCase();
  const cgpa = $("fCgpa").value === "" ? "" : parseFloat($("fCgpa").value);
  const branch = $("fBranch").value;
  const minSal = $("fSalary").value === "" ? 0 : parseFloat($("fSalary").value);
  const sort = $("fSort").value;

  let list = companies.filter((c) => {
    const text = (c.name + " " + c.role).toLowerCase();
    if (q && !text.includes(q)) return false;
    if (cgpa !== "" && cgpa < c.minCgpa) return false;       // CGPA filter
    if (branch && !c.branches.includes(branch)) return false; // branch filter
    if (c.salary < minSal) return false;                      // salary filter
    return true;
  });

  list.sort((a, b) => {
    if (sort === "salaryHigh") return b.salary - a.salary;
    if (sort === "salaryLow") return a.salary - b.salary;
    if (sort === "name") return a.name.localeCompare(b.name);
    // nearest deadline first, closed drives at the end
    const ad = a.daysLeft < 0 ? 9999 : a.daysLeft;
    const bd = b.daysLeft < 0 ? 9999 : b.daysLeft;
    return ad - bd;
  });
  return list;
}

function render() {
  const list = getFiltered();
  const open = list.filter((c) => c.daysLeft >= 0).length;
  $("resultCount").textContent = `Showing ${list.length} of ${companies.length} drives (${open} open for applications)`;

  // Cards
  $("cardView").innerHTML = list.length
    ? list.map((c) => `
      <article class="card">
        <div class="card-head">
          <div><h3>${c.name}</h3><div class="role">${c.role}</div></div>
          <div class="pkg">${c.salary.toFixed(1)}<small> LPA</small></div>
        </div>
        <dl>
          <dt>Location</dt><dd>${c.location}</dd>
          <dt>Min CGPA</dt><dd>${c.minCgpa.toFixed(1)}</dd>
          <dt>Deadline</dt><dd>${fmtDate(c.deadline)} ${deadlineBadge(c)}</dd>
        </dl>
        <div class="tags">${c.branches.map((b) => `<span class="tag">${b}</span>`).join("")}</div>
        <div class="tags">${c.skills.map((s) => `<span class="tag">${s}</span>`).join("")}</div>
        <button class="btn small" data-apply="${c.id}" ${c.daysLeft < 0 ? "disabled" : ""}>${c.daysLeft < 0 ? "Applications closed" : "Apply now"}</button>
      </article>`).join("")
    : '<div class="empty">No drives match your filters. Lower the minimum package or clear your branch, then try again.</div>';

  // Table
  $("tableBody").innerHTML = list.length
    ? list.map((c) => `
      <tr>
        <td><b>${c.name}</b></td><td>${c.role}</td><td>${c.salary.toFixed(1)} LPA</td>
        <td>${c.minCgpa.toFixed(1)}</td><td>${c.branches.join(", ")}</td>
        <td>${fmtDate(c.deadline)} ${deadlineBadge(c)}</td>
        <td><button class="btn small" data-apply="${c.id}" ${c.daysLeft < 0 ? "disabled" : ""}>Apply</button></td>
      </tr>`).join("")
    : '<tr><td colspan="7" style="text-align:center">No drives match your filters.</td></tr>';
}

function renderStats() {
  const open = companies.filter((c) => c.daysLeft >= 0);
  const max = Math.max(...companies.map((c) => c.salary));
  const avg = companies.reduce((sum, c) => sum + c.salary, 0) / companies.length; // calculation
  $("stats").innerHTML = `
    <div class="stat"><b>${companies.length}</b><span>Companies visiting</span></div>
    <div class="stat"><b>${open.length}</b><span>Drives open now</span></div>
    <div class="stat"><b>${max.toFixed(1)} LPA</b><span>Highest package</span></div>
    <div class="stat"><b>${avg.toFixed(1)} LPA</b><span>Average package</span></div>`;
}

function setView(v) {
  view = v;
  $("cardView").hidden = v !== "cards";
  $("tableView").hidden = v !== "table";
  $("cardViewBtn").classList.toggle("active", v === "cards");
  $("tableViewBtn").classList.toggle("active", v === "table");
}

// Fill the company dropdown in the application form (only open drives)
function fillCompanySelect() {
  $("company").innerHTML = '<option value="">Select company and role</option>' +
    companies.filter((c) => c.daysLeft >= 0)
      .map((c) => `<option value="${c.id}">${c.name} - ${c.role}</option>`).join("");
}

// Clicking any "Apply" button: pre-fill the form and scroll to it
function startApply(id) {
  $("company").value = id;
  if (!$("cgpa").value && $("fCgpa").value) $("cgpa").value = $("fCgpa").value;
  if (!$("branch").value && $("fBranch").value) $("branch").value = $("fBranch").value;
  $("apply").scrollIntoView();
  $("name").focus({ preventScroll: true });
}

/* ---------- 4. FORM VALIDATION ---------- */
const rules = {
  name:    { test: (v) => /^[A-Za-z][A-Za-z .'-]{2,}$/.test(v), msg: "Enter your full name (letters only, at least 3 characters)." },
  roll:    { test: (v) => /^[A-Za-z0-9-]{5,12}$/.test(v), msg: "Roll number must be 5 to 12 letters or digits, e.g. 22CS101." },
  email:   { test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: "Enter a valid email, e.g. you@college.edu." },
  phone:   { test: (v) => /^[6-9]\d{9}$/.test(v), msg: "Enter a 10-digit mobile number starting with 6, 7, 8 or 9." },
  branch:  { test: (v) => v !== "", msg: "Select your branch." },
  cgpa:    { test: (v) => v !== "" && !isNaN(v) && v >= 0 && v <= 10, msg: "CGPA must be a number between 0 and 10." },
  company: { test: (v) => v !== "", msg: "Select the company you are applying to." },
  skills:  { test: (v) => v.length >= 10, msg: "Describe your skills in at least 10 characters." }
};

function setFieldState(id, message) {
  const field = $(id).closest(".field");
  field.classList.toggle("invalid", message !== "");
  field.classList.toggle("valid", message === "");
  field.querySelector(".err").textContent = message;
}

function checkField(id) {
  const value = $(id).value.trim();
  const ok = rules[id].test(value);
  setFieldState(id, ok ? "" : rules[id].msg);
  return ok;
}

function validateForm() {
  let allOk = true;
  Object.keys(rules).forEach((id) => { if (!checkField(id)) allOk = false; });

  const agree = $("agree");
  const agreeField = agree.closest(".field");
  agreeField.querySelector(".err").textContent = agree.checked ? "" : "Tick the box to confirm your details.";
  if (!agree.checked) allOk = false;
  return allOk;
}

/* ---------- 5. SUBMIT + MY APPLICATIONS ---------- */
function loadApps() {
  try { return JSON.parse(localStorage.getItem("campushire_apps")) || []; }
  catch (e) { return []; }
}
function saveApps(apps) {
  try { localStorage.setItem("campushire_apps", JSON.stringify(apps)); } catch (e) { /* storage blocked */ }
}

function renderApps() {
  const apps = loadApps();
  $("appList").innerHTML = apps.length
    ? apps.map((a) => `
      <div class="app-item">
        <div><b>${esc(a.company)}</b> - ${esc(a.role)}
          <small>${esc(a.name)} (${esc(a.roll)}) | Applied on ${esc(a.date)} | ID: ${esc(a.id)}</small></div>
        <span class="badge ok">Under review</span>
      </div>`).join("")
    : '<div class="empty">You have not applied yet. Pick a drive in Opportunities and use Apply now.</div>';
}

function showModal(html) {
  $("modalBody").innerHTML = html;
  $("modal").hidden = false;
  $("modalClose").focus();
}

function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) {
    const firstBad = document.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
    if (firstBad) firstBad.focus();
    return;
  }

  const c = companies.find((x) => x.id === Number($("company").value));
  const cgpa = parseFloat($("cgpa").value);
  const branch = $("branch").value;
  const roll = $("roll").value.trim().toUpperCase();

  // Eligibility check
  const problem = eligibilityProblem(c, cgpa, branch);
  if (problem) { setFieldState("company", "Not eligible: " + problem); $("company").focus(); return; }

  // Duplicate check
  const apps = loadApps();
  if (apps.some((a) => a.roll === roll && a.companyId === c.id)) {
    setFieldState("company", "You have already applied to this company.");
    return;
  }

  const app = {
    id: "CH" + String(Date.now()).slice(-6),
    companyId: c.id, company: c.name, role: c.role, roll,
    name: $("name").value.trim(),
    date: fmtDate(new Date())
  };
  apps.unshift(app);
  saveApps(apps);
  renderApps();

  showModal(`
    <p>Thank you, <b>${esc(app.name)}</b>. Your application has been received.</p>
    <p><b>Company:</b> ${esc(c.name)} (${esc(c.role)})</p>
    <p><b>Package:</b> ${c.salary.toFixed(1)} LPA</p>
    <p><b>Application ID:</b> ${esc(app.id)}</p>
    <p>A confirmation will be sent to ${esc($("email").value.trim())}.</p>`);

  $("applyForm").reset();
  document.querySelectorAll(".field").forEach((f) => { f.classList.remove("valid", "invalid"); const s = f.querySelector(".err"); if (s) s.textContent = ""; });
}

/* ---------- 6. FAQ ACCORDION ---------- */
function renderFaq() {
  $("faqList").innerHTML = faqs.map((f) => `
    <div class="faq-item">
      <button class="faq-q" aria-expanded="false">${f[0]}</button>
      <div class="faq-a">${f[1]}</div>
    </div>`).join("");

  $("faqList").addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-q");
    if (!btn) return;
    const item = btn.parentElement;
    const willOpen = !item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((i) => { i.classList.remove("open"); i.querySelector(".faq-q").setAttribute("aria-expanded", "false"); });
    if (willOpen) { item.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
  });
}

/* ---------- 7. SETUP: connect everything with event listeners ---------- */
function init() {
  renderStats();
  fillCompanySelect();
  renderFaq();
  renderApps();
  render();

  // Live filtering while typing or changing any filter
  ["fSearch", "fCgpa", "fBranch", "fSalary", "fSort"].forEach((id) => {
    $(id).addEventListener("input", render);
    $(id).addEventListener("change", render);
  });
  $("filterForm").addEventListener("submit", (e) => e.preventDefault());
  $("resetBtn").addEventListener("click", () => { $("filterForm").reset(); render(); });

  $("cardViewBtn").addEventListener("click", () => setView("cards"));
  $("tableViewBtn").addEventListener("click", () => setView("table"));

  // One listener handles every Apply button (event delegation)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-apply]");
    if (btn && !btn.disabled) startApply(btn.dataset.apply);
  });

  // Validate each field when the user leaves it
  Object.keys(rules).forEach((id) => $(id).addEventListener("blur", () => checkField(id)));
  $("applyForm").addEventListener("submit", handleSubmit);

  // Modal
  $("modalClose").addEventListener("click", () => { $("modal").hidden = true; $("status").scrollIntoView(); });
  $("modal").addEventListener("click", (e) => { if (e.target === $("modal")) $("modal").hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("modal").hidden = true; });

  // Mobile menu
  $("menuBtn").addEventListener("click", () => {
    const open = $("nav").classList.toggle("open");
    $("menuBtn").setAttribute("aria-expanded", String(open));
  });
  $("nav").addEventListener("click", () => $("nav").classList.remove("open"));
}

document.addEventListener("DOMContentLoaded", init);
