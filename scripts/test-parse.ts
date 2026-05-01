import fs from "node:fs";
import Papa from "papaparse";

const text = fs.readFileSync("samples/student-registry-reference.csv", "utf-8");
const parsed = Papa.parse<Record<string, unknown>>(text, {
  header: true,
  skipEmptyLines: true,
});
console.log("Total CSV rows:", parsed.data.length);
console.log("Headers:", parsed.meta.fields);
console.log("First row keys:", Object.keys(parsed.data[0] ?? {}));
console.log("First row Enrollment Number:", parsed.data[0]?.["Enrollment Number"]);
console.log("First row Student Name:", parsed.data[0]?.["Student Name"]);
console.log("First row Class:", parsed.data[0]?.["Class"]);
let missing = { en: 0, name: 0, cls: 0 };
parsed.data.forEach((r: any) => {
  if (!r["Enrollment Number"]?.toString().trim()) missing.en++;
  if (!r["Student Name"]?.toString().trim()) missing.name++;
  if (!r["Class"]?.toString().trim()) missing.cls++;
});
console.log("Missing counts:", missing);
