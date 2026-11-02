// CA Final ABC Analysis — transcribed from the five user-uploaded Nov 2026 PDFs.
const abcAnalysisData = {
  FR: {
    marks:{A:"70–75",B:"25–30",C:"15"},
    categories:{
      A:["Ind AS 102 — Share Based Payment","Ind AS 115 — Revenue from Contracts with Customers","Ind AS 116 — Leases","Ind AS 109 — Financial Instruments","Ind AS 103 — Business Combinations","Ind AS 110, 28, 111 — Consolidated Financial Statements","Ind AS 1 — Presentation of Financial Statements","Ind AS 34 — Interim Financial Reporting","Ind AS 108 — Operating Segments","Conceptual Framework for FR under Ind AS","Professional & Ethical Duty of a CA","Accounting & Technology","Ind AS 101 — First Time Adoption of Ind AS"],
      B:["Ind AS 16 — PPE","Ind AS 38 — Intangible Assets","Ind AS 2 — Inventories","Ind AS 40 — Investment Property","Ind AS 19 — Employee Benefits","Ind AS 21 — Foreign Exchange","Ind AS 12 — Income Taxes","Ind AS 33 — EPS","Ind AS 36 — Impairment of Assets","Ind AS 41 — Agriculture","Ind AS 7 — Statement of Cash Flows","Ind AS 8 — Accounting Policies, Estimates & Errors","Ind AS 10 — Events After Reporting Period","Analysis of Financial Statements"],
      C:["Ind AS 23, 105, 20, 113","Introduction to Ind AS, Ind AS 37, Ind AS 24"]
    },
    guidance:{A:"Revision videos + Concept Book + Question Bank",B:"Revision videos + Concept Book + Question Bank",C:"Concept Book / Question Bank"}
  },
  AFM: {
    marks:{A:"80–85",B:"30–35",C:"4"},
    categories:{
      A:["Security Valuation","Portfolio Management","Mutual Funds","Derivatives Analysis and Valuation","Mergers, Acquisitions & Corporate Restructuring","Business Valuation","Financial Policy and Corporate Strategy","Risk Management","Security Analysis","Securitization","Startup Finance"],
      B:["Interest Rate Risk Management (IRRM)","Advanced Capital Budgeting Decisions","International Financial Management (IFM)","Forex"],
      C:["Theory Topics of Practical Chapters"]
    },
    guidance:{A:"Revision videos + Concept Book + Question Bank",B:"Revision videos or Concept Book + Question Bank",C:"Theory topics of practical chapters"}
  },
  Audit: {
    marks:{A:"75",B:"30–35",C:"10–15"},
    categories:{
      A:["SA (SQC 1, 220, 240, 250, 299, 402, 505, 540, 550, 560, 620, 705, 805, 810)","Professional Ethics","Reporting — Framing of Report and CARO","Emerging Areas — SDG & ESG Assurance","Group Audits","Audit of Public Sector Undertakings","Audit of Banks & NBFC"],
      B:["SA (315, 320, 510, 520, 530, 570, 600, 610, 701, 706, 710, 720, 800)","Review of Financial Information (SRE)","Prospective Financial Information & Other Assurance Services (SAE)","Related Services (SRS)","Forensic","Digital Auditing & Assurance"],
      C:["SA (200, 210, 230, 260, 265, 300, 330, 450, 500, 501, 580, 700)","Internal Audit","Investigation","Due Diligence","Risk Assessment & Internal Control"]
    },
    guidance:{A:"Concept Book + Important Questions",B:"Concept Book + Important Questions",C:"Concept Book / Important Questions"}
  },
  DT: {
    marks:{A:"80",B:"20",C:"15"},
    categories:{
      A:["Charitable Trust","TDS & TCS","Tax Audit and Ethical Compliances","Tax Planning, Tax Evasion & Tax Avoidance (GAAR)","Advance Rulings","Double Tax Relief","Transfer Pricing","NR Taxation (POEM, Sec. 9, 44B/BBA/BBC/BBD, 44C, NRI, 115A/BBA, FII)","PGBP (Basics, Concessional Rates — 115BAA to 115BAD, Deductions — 80GGB, 80JJAA, 80M, 80IAC, 10AA)","Various Entities (MAT, AMT, Cooperative Society, Business Trust, Investment Fund, Tonnage Tax)","Capital Gains (Slump Sales, 45(4) & 9B, ULIP, 50AA, Buyback, Tax Rates)"],
      B:["IFOS (115BB, 115BBJ, 115BBH)","Return Filing & Assessment Procedure (Return Filing, Updated ROI, Income Escaping Assessment, Search Assessment)","Appeals & Revision","Miscellaneous Provisions (Questions)","Penalties and Prosecution (Questions)","The Black Money & Imposition of Tax Law"],
      C:["Dispute Resolution","Income Tax Authorities","Application & Interpretation of Tax Treaties","Fundamentals of BEPS","Overview of Model Tax Conventions","Setoff","Deductions, IFOS, Various Entities, Capital Gains, NR Taxation — Other Topics","Basic Concepts & Exempt Income","Clubbing","Latest Developments in International Taxation","Case Laws"]
    },
    guidance:{A:"Concept Book + Important Questions + Revision Videos",B:"Concept Book + Important Questions + Revision Videos",C:"Concept Book / Important Questions"}
  },
  IDT: {
    marks:{A:"75",B:"30",C:"15"},
    categories:{
      A:["GST — Exemption From GST","GST — Charge under GST (Reverse Charge Mechanism and Composition Levy)","GST — Value of Supply","GST — Place of Supply","GST — Input Tax Credit","GST — Payment of Tax","GST — Registration (Procedural Part)","GST — Inspection, Search and Seizure","GST — Demand and Recovery","GST — Offence and Penalty and Ethical Aspects under GST","GST — Appeals & Revision","Customs — Levy and Types of Customs Duties","Customs — Exemptions from Customs Duties, Stores and Baggage","Customs — Valuations under Customs"],
      B:["GST — Supply under GST","GST — Time of Supply","GST — Electronic Commerce Transactions","GST — Returns","GST — Refund under GST","GST — Import and Export under GST","GST — Tax Invoice, Debit Note and Credit Note","GST — Registration (Except procedural part)","GST — Assessment and Audit","GST — Tax Deducted at Source","Customs — Importation and Exportation of Goods","Customs — Refund under Customs","Customs — Foreign Trade Policy"],
      C:["GST — Account and Records and E-way Bill","GST — Advance Ruling","GST — Liability in Certain Cases and Miscellaneous Provisions","Customs — Warehousing","Customs — Classification"]
    },
    guidance:{A:"Concept Book + Important Questions + Revision Videos",B:"Concept Book + Important Questions + Revision Videos",C:"Concept Book / Important Questions"}
  }
};
