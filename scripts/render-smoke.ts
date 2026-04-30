/**
 * Local smoke test for the certificate rendering pipeline.
 * Writes tmp/cert.html and tmp/cert.pdf using a fixed sample row.
 *
 * Run: npm run render:smoke
 *
 * Requires: a local Chrome/Chromium (auto-detected on common paths) or
 * CHROME_PATH env var. No Supabase or env vars needed for this smoke.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import { renderCertificateHtml } from "../lib/certificate/renderHtml";
import { computeTotals } from "../lib/grading/totals";
import { pickRemark } from "../lib/grading/remarks";
import {
  makeCertificateId,
  getAcademicYear,
  academicYearLabel,
} from "../lib/certificate/id";
import { launchBrowser, renderPdf } from "../lib/certificate/pdf";

const subjects = [
  { subject: "Mathematics", mark: 82 },
  { subject: "Science", mark: 76 },
  { subject: "English", mark: 88 },
  { subject: "Hindi", mark: 79 },
  { subject: "Social Science", mark: 78 },
];
const totals = computeTotals(subjects);
const certId = makeCertificateId({ cls: "5" });
const remark = pickRemark(totals.overall_grade, certId);

const html = renderCertificateHtml({
  studentName: "Meenakshi Sharma",
  className: "5",
  section: "A",
  enrollment: "UTT001212",
  examType: "Half-Yearly",
  academicYearLabel: academicYearLabel(getAcademicYear()),
  certificateId: certId,
  subjectGrades: totals.subject_grades,
  overallGrade: totals.overall_grade,
  remarkEn: remark.en,
  remarkHi: remark.hi,
});

const root = process.cwd();
mkdirSync(path.join(root, "tmp"), { recursive: true });
writeFileSync(path.join(root, "tmp", "cert.html"), html);
console.log(`Wrote tmp/cert.html  (${html.length} chars)`);

(async () => {
  const handle = await launchBrowser();
  try {
    const pdf = await renderPdf(handle.browser, html);
    writeFileSync(path.join(root, "tmp", "cert.pdf"), pdf);
    console.log(`Wrote tmp/cert.pdf  (${pdf.length} bytes)`);
    console.log(`Certificate ID: ${certId}`);
    console.log(`Overall grade:  ${totals.overall_grade}`);
  } finally {
    await handle.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
