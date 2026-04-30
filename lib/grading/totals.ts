import { gradeFor, type GradeBand } from "./grade";

export interface SubjectMark {
  subject: string;
  mark: number;
}

export interface SubjectGrade {
  subject: string;
  grade: GradeBand;
}

export interface Totals {
  total_marks: number;
  average: number; // percentage
  overall_grade: GradeBand;
  subject_grades: SubjectGrade[];
}

export function computeTotals(subjects: SubjectMark[]): Totals {
  if (subjects.length === 0) {
    return {
      total_marks: 0,
      average: 0,
      overall_grade: "F",
      subject_grades: [],
    };
  }
  const total = subjects.reduce((acc, s) => acc + s.mark, 0);
  const avg = total / subjects.length;
  return {
    total_marks: total,
    average: avg,
    overall_grade: gradeFor(avg),
    subject_grades: subjects.map((s) => ({
      subject: s.subject,
      grade: gradeFor(s.mark),
    })),
  };
}
