/* Canonical student master: email is the identity key. */
(function () {
  const CANONICAL_NAMES = {
    "adegm42qkiz6wiz@anonymous.ruangguru.com": "Aqhsa Aqila Hidayat"
  };

  const CANONICAL_NAME_ALIASES = {
    "eqbalatha": "Eqbal Atha Marvile",
    "muhammadzidanalfarabi": "Muhammad Zidan Alfaribi"
  };

  const norm = v => String(v ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  function canonicalStudent(student) {
    if (!student) return student;
    const email = String(student.email || student.email_address || student.email_siswa || "").trim().toLowerCase();
    const nameKey = norm(student.nama || student.name || "");
    const forced = CANONICAL_NAMES[email] || CANONICAL_NAME_ALIASES[nameKey];
    if (forced) student.nama = forced;
    return student;
  }

  function apply() {
    if (!window.dashboardData || !Array.isArray(window.dashboardData.students)) return;

    // Canonicalize names first.
    window.dashboardData.students.forEach(canonicalStudent);

    // One student per email; email is the primary identity key.
    const byEmail = new Map();
    const byFallback = new Map();
    const unique = [];

    window.dashboardData.students.forEach(student => {
      const email = String(student.email || student.email_address || student.email_siswa || "").trim().toLowerCase();
      const fallback = String(student.student_id || "").trim();
      const key = email || fallback;
      if (!key) { unique.push(student); return; }
      const map = email ? byEmail : byFallback;
      if (map.has(key)) return;
      map.set(key, student);
      unique.push(student);
    });

    window.dashboardData.students = unique;
  }

  window.applyStudentMasterFix = apply;
  if (document.readyState !== "loading") setTimeout(apply, 0);
  else document.addEventListener("DOMContentLoaded", () => setTimeout(apply, 0));
})();
