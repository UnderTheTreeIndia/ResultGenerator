import { readFileSync } from "node:fs";
import path from "node:path";
import type { GradeBand } from "@/lib/grading/grade";

export interface CertificateProps {
  studentName: string;
  className: string;
  section: string | null;
  enrollment: string;
  examType: string;
  academicYearLabel: string;
  certificateId: string;
  subjectGrades: { subject: string; grade: GradeBand }[];
  overallGrade: GradeBand;
  remarkEn: string;
  remarkHi: string;
}

let cachedLogo: string | null = null;
let cachedSig: string | null = null;

function dataUrl(absPath: string, mime: string): string {
  return `data:${mime};base64,${readFileSync(absPath).toString("base64")}`;
}

export function getLogoDataUrl(): string {
  if (cachedLogo) return cachedLogo;
  cachedLogo = dataUrl(
    path.join(process.cwd(), "public", "logo.png"),
    "image/png",
  );
  return cachedLogo;
}

export function getSignatureDataUrl(): string {
  if (cachedSig) return cachedSig;
  cachedSig = dataUrl(
    path.join(process.cwd(), "public", "signature.png"),
    "image/png",
  );
  return cachedSig;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderCertificateHtml(p: CertificateProps): string {
  const logoUrl = getLogoDataUrl();
  const signatureUrl = getSignatureDataUrl();
  const studentName = escapeHtml(p.studentName);
  const className = escapeHtml(p.className);
  const section = p.section ? escapeHtml(p.section) : null;
  const enrollment = escapeHtml(p.enrollment);
  const examType = escapeHtml(p.examType);
  const academicYearLabel = escapeHtml(p.academicYearLabel);
  const certificateId = escapeHtml(p.certificateId);
  const overallGrade = escapeHtml(p.overallGrade);
  const remarkEn = escapeHtml(p.remarkEn);
  const remarkHi = escapeHtml(p.remarkHi);

  const subjectRows = p.subjectGrades
    .map(
      (sg) =>
        `<tr><td>${escapeHtml(sg.subject)}</td><td class="r">${escapeHtml(sg.grade)}</td></tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Result Cum Certificate — ${studentName}</title>
<style>
@page { size: A4; margin: 0; }
html, body { margin: 0; padding: 0; background: #FBF7EE; font-family: Georgia, 'Times New Roman', serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; background: #FBF7EE; color: #2A2A2A; position: relative; overflow: hidden; }
.border-outer { position: absolute; inset: 8mm; border: 2px solid #2F6B3D; border-radius: 2mm; z-index: 1; }
.border-inner { position: absolute; inset: 12mm; border: 1px solid #C9A227; border-radius: 1mm; z-index: 1; }
.content { position: absolute; inset: 18mm; display: flex; flex-direction: column; z-index: 2; }
.header { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.logo { width: 26mm; height: 26mm; object-fit: contain; }
.title { font-size: 26pt; font-weight: 700; color: #2F6B3D; letter-spacing: 0.5px; margin-top: 4mm; }
.subtitle { font-size: 11pt; font-style: italic; color: #555; }
.ornament { margin: 5mm auto 3mm; width: 70%; text-align: center; color: #C9A227; font-size: 12pt; }
.ornament::before, .ornament::after { content: ""; display: inline-block; width: 30%; height: 1px; background: #C9A227; vertical-align: middle; margin: 0 8px; }
.award-line { text-align: center; font-size: 12pt; color: #555; margin-top: 1mm; }
.name { text-align: center; font-size: 30pt; font-weight: 700; color: #1F1F1F; margin: 3mm 0 2mm; letter-spacing: 1px; }
.meta { text-align: center; font-size: 11pt; color: #4A4A4A; letter-spacing: 0.6px; }
table.subjects { width: 80%; margin: 6mm auto 3mm; border-collapse: collapse; font-size: 12pt; background: rgba(251,247,238,0.78); }
table.subjects th, table.subjects td { padding: 7px 14px; border-bottom: 1px solid #E5DEC8; }
table.subjects th { text-align: left; color: #2F6B3D; font-weight: 700; border-bottom: 2px solid #2F6B3D; font-size: 10pt; letter-spacing: 1.2px; text-transform: uppercase; }
table.subjects th.r, table.subjects td.r { text-align: right; }
.grade-section { text-align: center; margin-top: 2mm; }
.grade-label { font-size: 10pt; letter-spacing: 4px; color: #2F6B3D; text-transform: uppercase; }
.grade-letter { margin-top: 1mm; font-size: 60pt; font-weight: 700; color: #2F6B3D; line-height: 1; }
.remarks { margin: 5mm 6mm 0; text-align: center; font-size: 11pt; line-height: 1.55; }
.remarks .en { font-style: italic; color: #2A2A2A; }
.remarks .hi { color: #2A2A2A; margin-top: 2mm; font-family: 'Noto Serif Devanagari', 'Mangal', Georgia, serif; }
.footer { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 4mm; }
.cert-id { font-family: 'Courier New', monospace; font-size: 9pt; color: #555; letter-spacing: 0.3px; max-width: 90mm; word-break: break-all; }
.cert-id-label { font-size: 8pt; text-transform: uppercase; letter-spacing: 2px; color: #888; display: block; margin-bottom: 2px; }
.signature { text-align: center; }
.signature img { height: 16mm; object-fit: contain; }
.signature .line { width: 56mm; height: 1px; background: #2F6B3D; margin: 2px auto 4px; }
.signature .name-sig { font-size: 11pt; font-weight: 700; }
.signature .role { font-size: 10pt; color: #555; font-style: italic; }
</style>
</head>
<body>
<div class="page">
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="content">
    <div class="header">
      <img class="logo" src="${logoUrl}" alt="UTT logo" />
      <div class="title">Result Cum Certificate</div>
      <div class="subtitle">${examType} Examination &middot; ${academicYearLabel}</div>
    </div>
    <div class="ornament">&#10086;</div>
    <div class="award-line">This certificate is proudly awarded to</div>
    <div class="name">${studentName}</div>
    <div class="meta">Class ${className}${section ? ` &middot; Section ${section}` : ""} &middot; Enrollment ${enrollment}</div>
    <table class="subjects">
      <thead><tr><th>Subject</th><th class="r">Grade</th></tr></thead>
      <tbody>${subjectRows}</tbody>
    </table>
    <div class="grade-section">
      <div class="grade-label">Overall Grade</div>
      <div class="grade-letter">${overallGrade}</div>
    </div>
    <div class="remarks">
      <div class="en">${remarkEn}</div>
      <div class="hi" lang="hi">${remarkHi}</div>
    </div>
    <div class="footer">
      <div class="cert-id">
        <span class="cert-id-label">Certificate ID</span>
        ${certificateId}
      </div>
      <div class="signature">
        <img src="${signatureUrl}" alt="Chief Mentor signature" />
        <div class="line"></div>
        <div class="name-sig">Meetali Anup Sinha</div>
        <div class="role">Chief Mentor</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}
