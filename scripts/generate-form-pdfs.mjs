import fs from "fs";
import path from "path";

const targetDir = path.resolve("public/forms");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function createPdf(title, formNo, dept) {
  const contentStream = `
BT
/F1 18 Tf
50 740 Td
(LAKSHMESHWAR TOWN MUNICIPAL COUNCIL) Tj
0 -26 Td
/F1 12 Tf
(Gadag District, Karnataka - Official Statutory Form) Tj
0 -36 Td
/F1 14 Tf
(${formNo}: ${title}) Tj
0 -22 Td
/F1 11 Tf
(Department: ${dept}) Tj
0 -30 Td
/F1 10 Tf
(Instructions:) Tj
0 -16 Td
(1. Fill all details in CAPITAL letters.) Tj
0 -14 Td
(2. Attach proof of identity, address proof, and required municipal receipts.) Tj
0 -14 Td
(3. Submit completed form to Lakshmeshwar TMC Citizen Facilitation Centre or Apply Online.) Tj
0 -30 Td
/F1 11 Tf
(Applicant Information:) Tj
0 -18 Td
/F1 10 Tf
(Full Name: _____________________________________________________) Tj
0 -18 Td
(Father/Spouse Name: _____________________________________________) Tj
0 -18 Td
(Mobile Number: _____________________  Ward Number: ______________) Tj
0 -18 Td
(Property/Khata/Assessment No: ___________________________________) Tj
0 -18 Td
(Present Address: _______________________________________________) Tj
0 -18 Td
(                _______________________________________________) Tj
0 -30 Td
/F1 11 Tf
(Declaration:) Tj
0 -18 Td
/F1 9 Tf
(I hereby declare that the information furnished above is true to the best of my knowledge.) Tj
0 -35 Td
/F1 10 Tf
(Date: ______________                                Signature of Applicant) Tj
ET
`.trim();

  const streamLength = Buffer.byteLength(contentStream, "utf-8");

  let pdf = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 5 0 R
    >>
  >>
>>
endobj
4 0 obj
<<
  /Length ${streamLength}
>>
stream
${contentStream}
endstream
endobj
5 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
>>
endobj
`;

  // Compute exact xref offsets
  const lines = pdf.split("\n");
  const objects = [1, 2, 3, 4, 5];
  const offsets = [];

  for (const objNum of objects) {
    const pattern = `${objNum} 0 obj`;
    const offset = pdf.indexOf(pattern);
    offsets.push(offset);
  }

  const xrefOffset = pdf.length;
  let xref = `xref
0 6
0000000000 65535 f \r
`;

  for (const offset of offsets) {
    xref += String(offset).padStart(10, "0") + " 00000 n \r\n";
  }

  const trailer = `trailer
<<
  /Size 6
  /Root 1 0 R
>>
startxref
${xrefOffset}
%%EOF
`;

  return Buffer.from(pdf + xref + trailer, "utf-8");
}

const forms = [
  {
    fileName: "tmc-w1-water-connection.pdf",
    title: "Application for Piped Drinking Water Connection",
    formNo: "Form TMC-W1",
    dept: "Water Supply Cell",
  },
  {
    fileName: "tmc-bp4-building-permission.pdf",
    title: "Building Construction Permission / Plan Sanction",
    formNo: "Form TMC-BP4",
    dept: "Town Planning Cell",
  },
  {
    fileName: "tmc-tl2-trade-license.pdf",
    title: "Trade License Application & Renewal Form",
    formNo: "Form TMC-TL2",
    dept: "Health & Sanitation Dept",
  },
  {
    fileName: "tmc-kt3-khata-transfer.pdf",
    title: "Application for Khata Transfer / Extract (Sasya)",
    formNo: "Form TMC-KT3",
    dept: "Revenue Cell",
  },
  {
    fileName: "tmc-noc1-electricity-borewell.pdf",
    title: "No Objection Certificate (NOC) for Electricity / Borewell",
    formNo: "Form TMC-NOC1",
    dept: "Engineering Section",
  },
  {
    fileName: "tmc-pm6-street-vendor.pdf",
    title: "Application for Street Vendor Registration (SVANidhi)",
    formNo: "Form TMC-PM6",
    dept: "Community Affairs",
  },
];

for (const form of forms) {
  const filePath = path.join(targetDir, form.fileName);
  const buffer = createPdf(form.title, form.formNo, form.dept);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated ${form.fileName} (${buffer.length} bytes)`);
}
console.log("All 6 statutory form PDFs generated successfully.");
