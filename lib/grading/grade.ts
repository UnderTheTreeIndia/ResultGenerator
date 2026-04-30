export type GradeBand = "A+" | "A" | "B+" | "B" | "C" | "D" | "F";

export const GRADE_BANDS: GradeBand[] = ["A+", "A", "B+", "B", "C", "D", "F"];

export function gradeFor(mark: number): GradeBand {
  if (mark >= 90) return "A+";
  if (mark >= 80) return "A";
  if (mark >= 70) return "B+";
  if (mark >= 60) return "B";
  if (mark >= 50) return "C";
  if (mark >= 33) return "D";
  return "F";
}

export const GRADE_LABEL: Record<GradeBand, string> = {
  "A+": "Outstanding",
  A: "Excellent",
  "B+": "Very Good",
  B: "Good",
  C: "Satisfactory",
  D: "Needs Improvement",
  F: "Significant Effort Required",
};
