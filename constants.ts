import { Experiment, ExperimentStatus, Sample, PlasmidFeature, AuditLogEntry, LabMachine } from './types';

// --- GENERATORS AND MOCK DATA ---

const generateExperiments = (): Experiment[] => {
  const exps: Experiment[] = [
    {
      id: 'EXP-2023-001',
      title: 'CRISPR-Cas9 Gene Editing of HEK293T Cells',
      author: 'Dr. Sarah Chen',
      date: '2023-10-15',
      status: ExperimentStatus.Completed,
      tags: ['CRISPR', 'HEK293T', 'Gene Editing'],
      content: `
        Day 1: Seeded HEK293T cells at 2x10^5 cells/well in a 6-well plate.
        Day 2: Transfection performed using Lipofectamine 3000. 
        Observed slightly lower confluency than expected (approx 60%). 
        Plasmid concentration was 500ng/uL. 
        Added 2.5uL of P3000 reagent per well.
        
        Day 3: Changed media. Cells look stressed, some detachment observed in Well A1 and A2.
        Day 4: Harvested cells for genomic DNA extraction.
        
        PCR Results: Band intensity for the target amplicon (500bp) was weak. 
        Sequencing indicates a low editing efficiency (<5%). 
        Suspect potential issue with the sgRNA design or the Lipofectamine lot #L2993.
      `,
      protocolSteps: [
        { id: 's1', instruction: 'Seed HEK293T cells', completed: true },
        { id: 's2', instruction: 'Prepare Transfection Mix', completed: true },
        { id: 's3', instruction: 'Incubate for 48h', completed: true },
        { id: 's4', instruction: 'Harvest and Lyse', completed: true },
      ]
    },
    {
      id: 'EXP-2023-004',
      title: 'Protein Purification: GFP Variant A',
      author: 'Dr. Sarah Chen',
      date: '2023-10-20',
      status: ExperimentStatus.InProgress,
      tags: ['Protein', 'Purification', 'GFP'],
      content: `
        Induced expression with 1mM IPTG at OD600 = 0.6.
        Incubated at 18°C overnight to improve solubility.
        
        Lysis Buffer: 50mM Tris pH 8.0, 300mM NaCl, 10mM Imidazole.
        Sonicated for 5 mins (30s on/30s off).
        
        Column run: Ni-NTA gravity flow.
        Elution fractions F1-F5 collected. F2 shows strong green fluorescence.
        Bradford assay pending for F2.
      `,
      protocolSteps: [
        { id: 'p1', instruction: 'Inoculate culture', completed: true },
        { id: 'p2', instruction: 'Induce with IPTG', completed: true },
        { id: 'p3', instruction: 'Harvest Cell Pellet', completed: false },
        { id: 'p4', instruction: 'Ni-NTA Purification', completed: false },
      ]
    }
  ];

  const topics = [
    "CRISPR Off-target Analysis", "Western Blot of p53", "PCR Optimization for GAPDH", 
    "Cell Viability Assay (MTT)", "RNA-seq Library Prep", "Confocal Microscopy of HeLa", 
    "Flow Cytometry Sorting", "ELISA for TNF-alpha", "Mass Spec Profiling", 
    "Drug Solubility Screening", "Bacterial Transformation Efficiency", "Primary Neuron Culture",
    "Lentiviral Transduction", "Organoid Growth Characterization", "Immunofluorescence Staining"
  ];
  const authors = ["Dr. Sarah Chen", "Mike Ross", "Dr. James Wilson", "Emily Zhang", "Dr. Robert Ford", "Lisa Wong", "Alex Patel"];
  const statuses = Object.values(ExperimentStatus);

  for (let i = 0; i < 118; i++) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)] as ExperimentStatus;
    
    // Random date within last year
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    
    exps.push({
      id: `EXP-2023-${String(100 + i).padStart(3, '0')}`,
      title: `${topic} - Replicate ${Math.floor(Math.random() * 5) + 1}`,
      author: author,
      date: date.toISOString().split('T')[0],
      status: status,
      tags: [topic.split(' ')[0], "Replicate", "Q3-Data"],
      content: `## Overview
Performed standard protocol for ${topic}. 

## Observations
- Incubation time: ${Math.floor(Math.random() * 24 + 2)} hours.
- Temperature: ${Math.random() > 0.5 ? '37°C' : 'Room Temp'}.
- Reagents used from Lot #${Math.floor(Math.random() * 9000 + 1000)}.

## Results
${Math.random() > 0.3 ? 'Results look promising. Signal detected.' : 'High background noise observed. Need to wash more thoroughly.'}
Sample purity estimated at ${Math.floor(Math.random() * 20 + 80)}%.`,
      protocolSteps: [
        { id: `step-${i}-1`, instruction: "Setup materials", completed: true },
        { id: `step-${i}-2`, instruction: "Run protocol", completed: status !== ExperimentStatus.Draft },
        { id: `step-${i}-3`, instruction: "Data collection", completed: status === ExperimentStatus.Completed }
      ]
    });
  }

  return exps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const generateSamples = (): Sample[] => {
  const baseSamples: Sample[] = [
    { id: 'SMP-001', name: 'HEK293T Aliquot', type: 'Cell Line', location: 'Freezer 1, Rack A', quantity: '10 vials', expiration: '2025-01-01', barcode: '1000101' },
    { id: 'SMP-002', name: 'Lipofectamine 3000', type: 'Reagent', location: 'Fridge 2, Shelf 1', quantity: '0.5 mL', expiration: '2024-06-15', barcode: '2000293' },
    { id: 'SMP-003', name: 'pCas9-GFP Vector', type: 'Plasmid', location: 'Freezer 1, Box 3', quantity: '20 uL', expiration: '2026-12-31', barcode: '3000555' },
    { id: 'SMP-004', name: 'LB Broth', type: 'Reagent', location: 'Cabinet 4', quantity: '5 L', expiration: '2024-11-20', barcode: '4000111' },
  ];

  const types = ['Antibody', 'Chemical', 'Consumable', 'Reagent', 'Cell Line'];
  const locations = ['Freezer 1', 'Freezer 2', 'Fridge 1', 'Chemical Cabinet', 'Cold Room', 'Shelf B'];
  const items = [
    "Anti-Actin Mouse mAb", "Anti-GAPDH Rabbit pAb", "DAPI Stain", "Trypan Blue", "Ethanol 70%",
    "Methanol", "DMSO", "Triton X-100", "Paraformaldehyde 4%", "PBS 1x", "Tris-HCL",
    "Pipette Tips 10uL", "Pipette Tips 200uL", "Falcon Tubes 15mL", "Falcon Tubes 50mL",
    "HeLa Cells P4", "CHO-K1 Cells", "Jurkat T-Cells", "Primary Mouse Neurons", "E. coli DH5a"
  ];

  for (let i = 0; i < 60; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const type = types[Math.floor(Math.random() * types.length)]; // Simplified mapping
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 500));

    baseSamples.push({
      id: `SMP-${String(100 + i).padStart(3, '0')}`,
      name: `${item} (Lot ${Math.floor(Math.random() * 999)})`,
      type: item.includes("Cell") ? "Cell Line" : item.includes("Anti") ? "Antibody" : item.includes("Pipette") ? "Consumable" : "Reagent",
      location: loc,
      quantity: `${Math.floor(Math.random() * 50 + 1)} units`,
      expiration: date.toISOString().split('T')[0],
      barcode: String(Math.floor(Math.random() * 8999999 + 1000000))
    });
  }
  
  return baseSamples;
}

export const MOCK_EXPERIMENTS: Experiment[] = generateExperiments();
export const MOCK_SAMPLES: Sample[] = generateSamples();

export const MOCK_MACHINES: LabMachine[] = [
  {
    id: 'EQ-001',
    name: 'QuantStudio 5 qPCR',
    type: 'PCR System',
    location: 'Room 302, Bench 1',
    status: 'Available',
    bookings: [
      { id: 'B-101', userId: 'U-005', userName: 'John Doe', startTime: new Date(new Date().setHours(14,0,0,0)).toISOString(), endTime: new Date(new Date().setHours(16,0,0,0)).toISOString(), purpose: 'Gene Expression Analysis' }
    ],
    nextMaintenance: '2023-12-15'
  },
  {
    id: 'EQ-002',
    name: 'Beckman Coulter Centrifuge',
    type: 'Centrifuge',
    location: 'Central Prep Area',
    status: 'In Use',
    bookings: [
      { id: 'B-102', userId: 'U-001', userName: 'Dr. Sarah Chen', startTime: new Date(new Date().setHours(9,0,0,0)).toISOString(), endTime: new Date(new Date().setHours(11,0,0,0)).toISOString(), purpose: 'Cell Pelleting' }
    ],
    nextMaintenance: '2024-01-10'
  },
  {
    id: 'EQ-003',
    name: 'Zeiss LSM 900 Confocal',
    type: 'Microscope',
    location: 'Dark Room A',
    status: 'Maintenance',
    bookings: [],
    nextMaintenance: '2023-11-01'
  },
  {
    id: 'EQ-004',
    name: 'NanoDrop One',
    type: 'Spectrophotometer',
    location: 'Room 302, Bench 3',
    status: 'Available',
    bookings: [],
    nextMaintenance: '2024-02-20'
  },
  {
    id: 'EQ-005',
    name: 'FACSAria Fusion',
    type: 'Flow Cytometer',
    location: 'Core Facility',
    status: 'Available',
    bookings: [
        { id: 'B-103', userId: 'U-002', userName: 'Mike Ross', startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), endTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), purpose: 'Sorting GFP+ cells' }
    ],
    nextMaintenance: '2023-11-15'
  },
  {
      id: 'EQ-006',
      name: 'Agilent 1260 Infinity II',
      type: 'HPLC',
      location: 'Analytical Lab',
      status: 'Available',
      bookings: [],
      nextMaintenance: '2024-03-01'
  },
  {
      id: 'EQ-007',
      name: 'Thermo Heracell 150i',
      type: 'Incubator',
      location: 'Tissue Culture Room',
      status: 'Available',
      bookings: [],
      nextMaintenance: '2024-06-12'
  },
  {
      id: 'EQ-008',
      name: 'Eppendorf Mastercycler X50',
      type: 'PCR System',
      location: 'Room 302, Bench 2',
      status: 'In Use',
      bookings: [{ id: 'B-104', userId: 'U-003', userName: 'Emily Zhang', startTime: new Date().toISOString(), endTime: new Date(new Date().getTime() + 3600000).toISOString(), purpose: 'Colony PCR' }],
      nextMaintenance: '2023-12-20'
  },
  {
      id: 'EQ-009',
      name: 'Tecan Spark',
      type: 'Plate Reader',
      location: 'Room 302, Bench 4',
      status: 'Available',
      bookings: [],
      nextMaintenance: '2024-01-30'
  },
  {
      id: 'EQ-010',
      name: 'Illumina MiSeq',
      type: 'Sequencer',
      location: 'Core Facility',
      status: 'Maintenance',
      bookings: [],
      nextMaintenance: '2023-11-05'
  },
  {
      id: 'EQ-011',
      name: 'Bio-Rad ChemiDoc',
      type: 'Imager',
      location: 'Gel Room',
      status: 'Available',
      bookings: [],
      nextMaintenance: '2024-02-14'
  },
  {
      id: 'EQ-012',
      name: 'Milli-Q IQ 7000',
      type: 'Water System',
      location: 'Prep Room',
      status: 'Available',
      bookings: [],
      nextMaintenance: '2024-05-01'
  }
];

export const MOCK_PLASMID_FEATURES: PlasmidFeature[] = [
  { name: 'CMV Promoter', start: 100, end: 600, type: 'promoter', color: '#6366f1', direction: 1 }, 
  { name: 'EGFP', start: 650, end: 1370, type: 'gene', color: '#10b981', direction: 1 },
  { name: 'SV40 PolyA', start: 1400, end: 1600, type: 'terminator', color: '#ef4444', direction: 1 },
  { name: 'AmpR', start: 2500, end: 3300, type: 'resistance', color: '#f59e0b', direction: -1 },
  { name: 'pUC Ori', start: 3500, end: 4000, type: 'origin', color: '#64748b', direction: -1 },
];

export const TEMP_LOGS = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  freezer1: -80 + (Math.random() * 2 - 1), // Stable around -80
  freezer2: i > 2 && i < 6 ? -65 + (Math.random() * 2) : -80 + (Math.random() * 2 - 1), // Excursion at 3am
}));

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-1005',
    timestamp: '2023-10-21T09:15:22',
    user: 'Dr. Sarah Chen',
    action: 'Update',
    resourceType: 'Experiment',
    resourceId: 'EXP-2023-004',
    details: 'Updated observation notes regarding elution fraction purity.'
  },
  {
    id: 'LOG-1004',
    timestamp: '2023-10-21T08:30:00',
    user: 'Dr. Sarah Chen',
    action: 'Login',
    resourceType: 'System',
    details: 'User logged in successfully from IP 192.168.1.10.'
  },
  {
    id: 'LOG-1003',
    timestamp: '2023-10-20T16:45:10',
    user: 'System Admin',
    action: 'Update',
    resourceType: 'Inventory',
    resourceId: 'SMP-002',
    details: 'Adjusted stock level for Lipofectamine 3000 (Batch check).'
  },
  {
    id: 'LOG-1002',
    timestamp: '2023-10-20T14:20:00',
    user: 'Dr. Sarah Chen',
    action: 'Create',
    resourceType: 'Experiment',
    resourceId: 'EXP-2023-004',
    details: 'Created new experiment "Protein Purification: GFP Variant A"'
  },
  {
    id: 'LOG-1001',
    timestamp: '2023-10-15T11:00:00',
    user: 'Dr. Sarah Chen',
    action: 'Sign',
    resourceType: 'Experiment',
    resourceId: 'EXP-2023-001',
    details: 'Digital Signature applied. Hash: 8f4b2e1...'
  }
];

export const PROTOCOL_TEMPLATES = [
  {
    category: "Sample & basic lab work",
    items: [
      "Sample receipt / registration",
      "Sample preparation (dilution, extraction, cleanup)",
      "Buffer / reagent preparation",
      "Solution formulation / mixing",
      "Storage / stability / freeze–thaw",
      "Container closure / compatibility"
    ]
  },
  {
    category: "Molecular biology & genetics",
    items: [
      "DNA/RNA extraction",
      "PCR / endpoint PCR",
      "qPCR / RT‑qPCR",
      "Gel electrophoresis (DNA/RNA/protein)",
      "Cloning / assembly (Gibson, Golden Gate)",
      "Transfection / transduction",
      "Sequencing (Sanger / NGS sample prep, sequencing run, analysis)"
    ]
  },
  {
    category: "Protein & biochemical",
    items: [
        "Protein expression",
        "Protein purification (affinity, SEC, IEX)",
        "Protein quantification (BCA, Bradford)",
        "Enzyme kinetics / activity assay (IC50 / EC50)",
        "Binding assay (general)",
        "SPR / BLI binding kinetics",
        "ITC (binding thermodynamics)"
    ]
  },
  {
      category: "Cell-based assays",
      items: [
          "Cell culture / passaging",
          "Viability / cytotoxicity (MTT, CellTiter‑Glo)",
          "Proliferation assay",
          "Apoptosis assay",
          "Reporter gene assay",
          "Flow cytometry / cell sorting",
          "Imaging assay / microscopy + image analysis"
      ]
  },
  {
      category: "Immunoassays",
      items: [
          "ELISA",
          "Western blot",
          "Immunofluorescence / immunohistochemistry",
          "ELISpot / FluoroSpot"
      ]
  },
  {
      category: "Analytical chemistry & characterization",
      items: [
          "HPLC / UHPLC",
          "LC‑MS / MS",
          "GC / GC‑MS",
          "UV/Vis spectroscopy",
          "Fluorescence / luminescence plate reader assay",
          "Raman / IR",
          "NMR"
      ]
  },
  {
      category: "Biophysics & formulation developability",
      items: [
          "DLS (aggregation, size)",
          "DSC (thermal stability)",
          "Solubility / precipitation testing",
          "pH profile / pKa-related studies",
          "Forced degradation / stress testing"
      ]
  },
  {
      category: "Process / manufacturing / QC",
      items: [
          "Method development",
          "Method qualification / validation",
          "QC release testing",
          "Batch record / run",
          "Deviation / incident / OOS investigation",
          "Equipment qualification / calibration check"
      ]
  },
  {
      category: "In vivo / ex vivo",
      items: [
          "Animal dosing / study execution",
          "Tissue collection / necropsy",
          "Ex vivo assay"
      ]
  }
];