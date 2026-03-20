// Chapter data for Class 11 and Class 12 Biology
export const class11Chapters = [
  { id: 1, name: "The Living World", questionCount: 100 },
  { id: 2, name: "Biological Classification", questionCount: 100 },
  { id: 3, name: "Plant Kingdom", questionCount: 100 },
  { id: 4, name: "Animal Kingdom", questionCount: 100 },
  { id: 5, name: "Morphology of Flowering Plants", questionCount: 100 },
  { id: 6, name: "Anatomy of Flowering Plants", questionCount: 100 },
  { id: 7, name: "Structural Organisation in Animals", questionCount: 100 },
  { id: 8, name: "Cell – The Unit of Life", questionCount: 100 },
  { id: 9, name: "Biomolecules", questionCount: 100 },
  { id: 10, name: "Cell Cycle and Cell Division", questionCount: 100 },
  { id: 11, name: "Transport in Plants", questionCount: 100 },
  { id: 12, name: "Mineral Nutrition", questionCount: 100 },
  { id: 13, name: "Photosynthesis in Higher Plants", questionCount: 100 },
  { id: 14, name: "Respiration in Plants", questionCount: 100 },
  { id: 15, name: "Plant Growth and Development", questionCount: 100 },
  { id: 16, name: "Digestion and Absorption", questionCount: 100 },
  { id: 17, name: "Breathing and Exchange of Gases", questionCount: 100 },
  { id: 18, name: "Body Fluids and Circulation", questionCount: 100 },
  { id: 19, name: "Excretory Products and their Elimination", questionCount: 100 },
  { id: 20, name: "Locomotion and Movement", questionCount: 100 },
  { id: 21, name: "Neural Control and Coordination", questionCount: 100 },
  { id: 22, name: "Chemical Coordination and Integration", questionCount: 100 },
];

export const class12Chapters = [
  { id: 23, name: "Reproduction in Organisms", questionCount: 100 },
  { id: 24, name: "Sexual Reproduction in Flowering Plants", questionCount: 100 },
  { id: 25, name: "Human Reproduction", questionCount: 100 },
  { id: 26, name: "Reproductive Health", questionCount: 100 },
  { id: 27, name: "Principles of Inheritance and Variation", questionCount: 100 },
  { id: 28, name: "Molecular Basis of Inheritance", questionCount: 100 },
  { id: 29, name: "Evolution", questionCount: 100 },
  { id: 30, name: "Human Health and Disease", questionCount: 100 },
  { id: 31, name: "Strategies for Enhancement in Food Production", questionCount: 100 },
  { id: 32, name: "Microbes in Human Welfare", questionCount: 100 },
  { id: 33, name: "Biotechnology Principles and Processes", questionCount: 100 },
  { id: 34, name: "Biotechnology and its Applications", questionCount: 100 },
  { id: 35, name: "Organisms and Populations", questionCount: 100 },
  { id: 36, name: "Ecosystem", questionCount: 100 },
  { id: 37, name: "Biodiversity and Conservation", questionCount: 100 },
  { id: 38, name: "Environmental Issues", questionCount: 100 },
];

export type Question = {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  chapterId: number;
  chapterName: string;
  source: "PYQ" | "NCERT";
  year?: number;
};

// Sample questions for demo and practice - 180+ questions covering all 38 chapters
export const sampleQuestions: Question[] = [
  // ============ CLASS 11 CHAPTERS ============
  
  // Chapter 1: The Living World (5 questions)
  {
    id: 1,
    question: "Which of the following is a defining characteristic of living organisms?",
    options: { A: "Growth", B: "Reproduction", C: "Metabolism", D: "All of the above" },
    correctAnswer: "C",
    explanation: "Metabolism is the defining characteristic as it is unique to living organisms. As per NCERT, metabolism involves anabolic and catabolic reactions.",
    chapterId: 1, chapterName: "The Living World", source: "PYQ", year: 2020
  },
  {
    id: 2,
    question: "Binomial nomenclature was introduced by:",
    options: { A: "Aristotle", B: "Linnaeus", C: "Theophrastus", D: "John Ray" },
    correctAnswer: "B",
    explanation: "Carolus Linnaeus introduced the binomial nomenclature system in 'Species Plantarum' (1753).",
    chapterId: 1, chapterName: "The Living World", source: "NCERT"
  },
  {
    id: 3,
    question: "The basic unit of classification is:",
    options: { A: "Genus", B: "Species", C: "Family", D: "Order" },
    correctAnswer: "B",
    explanation: "Species is the basic unit of classification - organisms that can interbreed and produce fertile offspring.",
    chapterId: 1, chapterName: "The Living World", source: "PYQ", year: 2019
  },
  {
    id: 4,
    question: "Which of the following is the correct sequence of taxonomic categories?",
    options: { A: "Species-Order-Family-Genus", B: "Species-Genus-Order-Family", C: "Species-Genus-Family-Order", D: "Species-Family-Genus-Order" },
    correctAnswer: "C",
    explanation: "The correct hierarchy is: Species → Genus → Family → Order → Class → Phylum → Kingdom.",
    chapterId: 1, chapterName: "The Living World", source: "NCERT"
  },
  {
    id: 5,
    question: "Taxonomic key is also called:",
    options: { A: "Indented key", B: "Bracketed key", C: "Both A and B", D: "None of these" },
    correctAnswer: "C",
    explanation: "Taxonomic keys are identification keys also known as indented or bracketed keys based on contrasting characters.",
    chapterId: 1, chapterName: "The Living World", source: "PYQ", year: 2018
  },

  // Chapter 2: Biological Classification (5 questions)
  {
    id: 6,
    question: "Five kingdom classification was proposed by:",
    options: { A: "Ernst Haeckel", B: "R.H. Whittaker", C: "Carl Woese", D: "Linnaeus" },
    correctAnswer: "B",
    explanation: "R.H. Whittaker proposed the five kingdom classification in 1969 - Monera, Protista, Fungi, Plantae, Animalia.",
    chapterId: 2, chapterName: "Biological Classification", source: "PYQ", year: 2021
  },
  {
    id: 7,
    question: "Which of the following is a characteristic feature of Kingdom Monera?",
    options: { A: "Membrane-bound organelles", B: "70S ribosomes", C: "Nuclear membrane", D: "Multicellular organization" },
    correctAnswer: "B",
    explanation: "Monerans are prokaryotes with 70S ribosomes, lacking membrane-bound organelles and nuclear membrane.",
    chapterId: 2, chapterName: "Biological Classification", source: "NCERT"
  },
  {
    id: 8,
    question: "Cyanobacteria are also known as:",
    options: { A: "Green algae", B: "Blue-green algae", C: "Brown algae", D: "Red algae" },
    correctAnswer: "B",
    explanation: "Cyanobacteria are called blue-green algae due to their photosynthetic pigments phycocyanin and chlorophyll.",
    chapterId: 2, chapterName: "Biological Classification", source: "NCERT"
  },
  {
    id: 9,
    question: "Which kingdom includes organisms that are decomposers?",
    options: { A: "Monera", B: "Protista", C: "Fungi", D: "Plantae" },
    correctAnswer: "C",
    explanation: "Fungi are the principal decomposers in ecosystems, breaking down organic matter through saprophytic nutrition.",
    chapterId: 2, chapterName: "Biological Classification", source: "PYQ", year: 2020
  },
  {
    id: 10,
    question: "Viruses are considered as:",
    options: { A: "Living organisms", B: "Non-living entities", C: "Connecting link between living and non-living", D: "Prokaryotes" },
    correctAnswer: "C",
    explanation: "Viruses are at the borderline of living and non-living - they show characteristics of both states.",
    chapterId: 2, chapterName: "Biological Classification", source: "NCERT"
  },

  // Chapter 3: Plant Kingdom (5 questions)
  {
    id: 11,
    question: "Which division of plants is called 'amphibians of plant kingdom'?",
    options: { A: "Thallophyta", B: "Bryophyta", C: "Pteridophyta", D: "Gymnosperms" },
    correctAnswer: "B",
    explanation: "Bryophytes are called amphibians of plant kingdom as they require water for fertilization but live on land.",
    chapterId: 3, chapterName: "Plant Kingdom", source: "PYQ", year: 2019
  },
  {
    id: 12,
    question: "The main plant body in bryophytes is:",
    options: { A: "Sporophyte", B: "Gametophyte", C: "Both equally dominant", D: "Neither" },
    correctAnswer: "B",
    explanation: "In bryophytes, the gametophyte is the dominant generation, while sporophyte is dependent on it.",
    chapterId: 3, chapterName: "Plant Kingdom", source: "NCERT"
  },
  {
    id: 13,
    question: "Heterospory is observed in:",
    options: { A: "Selaginella", B: "Funaria", C: "Riccia", D: "Marchantia" },
    correctAnswer: "A",
    explanation: "Selaginella shows heterospory - producing two types of spores: microspores and megaspores.",
    chapterId: 3, chapterName: "Plant Kingdom", source: "PYQ", year: 2021
  },
  {
    id: 14,
    question: "Double fertilization is characteristic of:",
    options: { A: "Gymnosperms", B: "Angiosperms", C: "Pteridophytes", D: "Bryophytes" },
    correctAnswer: "B",
    explanation: "Double fertilization is unique to angiosperms - one sperm fuses with egg, another with polar nuclei.",
    chapterId: 3, chapterName: "Plant Kingdom", source: "NCERT"
  },
  {
    id: 15,
    question: "Which group of plants lacks vascular tissue?",
    options: { A: "Pteridophytes", B: "Gymnosperms", C: "Bryophytes", D: "Angiosperms" },
    correctAnswer: "C",
    explanation: "Bryophytes lack true vascular tissue (xylem and phloem) and are therefore called non-vascular plants.",
    chapterId: 3, chapterName: "Plant Kingdom", source: "PYQ", year: 2018
  },

  // Chapter 4: Animal Kingdom (5 questions)
  {
    id: 16,
    question: "Which phylum shows tissue level of organization?",
    options: { A: "Porifera", B: "Cnidaria", C: "Platyhelminthes", D: "Annelida" },
    correctAnswer: "B",
    explanation: "Cnidarians show tissue level organization while Porifera shows cellular level organization.",
    chapterId: 4, chapterName: "Animal Kingdom", source: "PYQ", year: 2020
  },
  {
    id: 17,
    question: "Radial symmetry is found in:",
    options: { A: "Earthworm", B: "Hydra", C: "Cockroach", D: "Frog" },
    correctAnswer: "B",
    explanation: "Hydra (Cnidaria) shows radial symmetry - body can be divided into equal halves by any plane through central axis.",
    chapterId: 4, chapterName: "Animal Kingdom", source: "NCERT"
  },
  {
    id: 18,
    question: "Flame cells are excretory structures found in:",
    options: { A: "Annelids", B: "Arthropods", C: "Platyhelminthes", D: "Molluscs" },
    correctAnswer: "C",
    explanation: "Flame cells or protonephridia are excretory structures found in Platyhelminthes (flatworms).",
    chapterId: 4, chapterName: "Animal Kingdom", source: "PYQ", year: 2019
  },
  {
    id: 19,
    question: "Open circulatory system is found in:",
    options: { A: "Earthworm", B: "Cockroach", C: "Frog", D: "Fish" },
    correctAnswer: "B",
    explanation: "Arthropods like cockroach have open circulatory system where blood flows in open spaces called sinuses.",
    chapterId: 4, chapterName: "Animal Kingdom", source: "NCERT"
  },
  {
    id: 20,
    question: "Which of the following is a characteristic of Chordates?",
    options: { A: "Ventral nerve cord", B: "Dorsal hollow nerve cord", C: "Solid nerve cord", D: "Ladder-like nervous system" },
    correctAnswer: "B",
    explanation: "Dorsal hollow nerve cord is a defining characteristic of all chordates, along with notochord and pharyngeal gill slits.",
    chapterId: 4, chapterName: "Animal Kingdom", source: "PYQ", year: 2021
  },

  // Chapter 5: Morphology of Flowering Plants (5 questions)
  {
    id: 21,
    question: "The modification of stem for food storage is seen in:",
    options: { A: "Potato", B: "Sweet potato", C: "Carrot", D: "Radish" },
    correctAnswer: "A",
    explanation: "Potato is a modified stem (tuber) for food storage. Sweet potato, carrot, and radish are modified roots.",
    chapterId: 5, chapterName: "Morphology of Flowering Plants", source: "PYQ", year: 2020
  },
  {
    id: 22,
    question: "Pneumatophores are found in:",
    options: { A: "Mangrove plants", B: "Desert plants", C: "Aquatic plants", D: "Parasitic plants" },
    correctAnswer: "A",
    explanation: "Pneumatophores are breathing roots found in mangrove plants like Rhizophora to obtain oxygen from air.",
    chapterId: 5, chapterName: "Morphology of Flowering Plants", source: "NCERT"
  },
  {
    id: 23,
    question: "Phyllode is a modified:",
    options: { A: "Stem", B: "Leaf", C: "Petiole", D: "Stipule" },
    correctAnswer: "C",
    explanation: "Phyllode is a modified flattened petiole that performs photosynthesis, seen in Australian Acacia.",
    chapterId: 5, chapterName: "Morphology of Flowering Plants", source: "PYQ", year: 2019
  },
  {
    id: 24,
    question: "In pea, the__(a)__ is modified into tendrils for climbing:",
    options: { A: "Leaf", B: "Leaflet", C: "Stipule", D: "Entire leaf" },
    correctAnswer: "B",
    explanation: "In pea plant, the upper leaflets are modified into tendrils for climbing support.",
    chapterId: 5, chapterName: "Morphology of Flowering Plants", source: "NCERT"
  },
  {
    id: 25,
    question: "Epipetalous stamens are found in:",
    options: { A: "Lily", B: "Brinjal", C: "China rose", D: "Pea" },
    correctAnswer: "B",
    explanation: "Epipetalous stamens (attached to petals) are found in brinjal (Solanaceae family).",
    chapterId: 5, chapterName: "Morphology of Flowering Plants", source: "PYQ", year: 2018
  },

  // Chapter 6: Anatomy of Flowering Plants (5 questions)
  {
    id: 26,
    question: "Casparian strips are found in:",
    options: { A: "Cortex", B: "Epidermis", C: "Endodermis", D: "Pericycle" },
    correctAnswer: "C",
    explanation: "Casparian strips are bands of suberin found in the endodermis, regulating water and mineral transport.",
    chapterId: 6, chapterName: "Anatomy of Flowering Plants", source: "PYQ", year: 2021
  },
  {
    id: 27,
    question: "Collenchyma differs from parenchyma in having:",
    options: { A: "Living protoplasm", B: "Pectin deposits at corners", C: "Intercellular spaces", D: "Isodiametric cells" },
    correctAnswer: "B",
    explanation: "Collenchyma has pectin and hemicellulose thickenings at corners, providing flexibility with support.",
    chapterId: 6, chapterName: "Anatomy of Flowering Plants", source: "NCERT"
  },
  {
    id: 28,
    question: "Which tissue is responsible for secondary growth in plants?",
    options: { A: "Parenchyma", B: "Apical meristem", C: "Lateral meristem", D: "Intercalary meristem" },
    correctAnswer: "C",
    explanation: "Lateral meristem (vascular cambium and cork cambium) is responsible for secondary growth in dicots.",
    chapterId: 6, chapterName: "Anatomy of Flowering Plants", source: "PYQ", year: 2020
  },
  {
    id: 29,
    question: "Bicollateral vascular bundles are found in:",
    options: { A: "Monocot stem", B: "Dicot stem", C: "Cucurbita stem", D: "Fern" },
    correctAnswer: "C",
    explanation: "Bicollateral bundles (phloem on both sides of xylem) are characteristic of Cucurbita (pumpkin family).",
    chapterId: 6, chapterName: "Anatomy of Flowering Plants", source: "NCERT"
  },
  {
    id: 30,
    question: "In monocot stem, vascular bundles are:",
    options: { A: "Open and scattered", B: "Closed and scattered", C: "Open and in a ring", D: "Closed and in a ring" },
    correctAnswer: "B",
    explanation: "In monocot stem, vascular bundles are closed (lack cambium) and scattered throughout the ground tissue.",
    chapterId: 6, chapterName: "Anatomy of Flowering Plants", source: "PYQ", year: 2019
  },

  // Chapter 7: Structural Organisation in Animals (5 questions)
  {
    id: 31,
    question: "Which type of epithelium lines the inner surface of blood vessels?",
    options: { A: "Squamous", B: "Cuboidal", C: "Columnar", D: "Ciliated" },
    correctAnswer: "A",
    explanation: "Simple squamous epithelium (endothelium) lines blood vessels, providing a smooth surface for blood flow.",
    chapterId: 7, chapterName: "Structural Organisation in Animals", source: "PYQ", year: 2020
  },
  {
    id: 32,
    question: "Tendons connect:",
    options: { A: "Bone to bone", B: "Muscle to bone", C: "Muscle to muscle", D: "Nerve to muscle" },
    correctAnswer: "B",
    explanation: "Tendons are dense regular connective tissue connecting muscles to bones, made of collagen fibers.",
    chapterId: 7, chapterName: "Structural Organisation in Animals", source: "NCERT"
  },
  {
    id: 33,
    question: "Malpighian tubules are excretory organs in:",
    options: { A: "Earthworm", B: "Cockroach", C: "Frog", D: "Fish" },
    correctAnswer: "B",
    explanation: "Malpighian tubules are the excretory organs in insects like cockroach, removing nitrogenous wastes.",
    chapterId: 7, chapterName: "Structural Organisation in Animals", source: "PYQ", year: 2019
  },
  {
    id: 34,
    question: "The blood of cockroach is:",
    options: { A: "Red colored", B: "Blue colored", C: "Colorless", D: "Green colored" },
    correctAnswer: "C",
    explanation: "Cockroach blood (haemolymph) is colorless as it lacks respiratory pigment; it doesn't transport oxygen.",
    chapterId: 7, chapterName: "Structural Organisation in Animals", source: "NCERT"
  },
  {
    id: 35,
    question: "Compound eyes are found in:",
    options: { A: "Earthworm", B: "Frog", C: "Cockroach", D: "Hydra" },
    correctAnswer: "C",
    explanation: "Compound eyes made of many ommatidia are found in arthropods like cockroach, providing mosaic vision.",
    chapterId: 7, chapterName: "Structural Organisation in Animals", source: "PYQ", year: 2018
  },

  // Chapter 8: Cell - The Unit of Life (5 questions)
  {
    id: 36,
    question: "The cell organelle involved in the formation of lysosomes is:",
    options: { A: "Endoplasmic reticulum", B: "Golgi apparatus", C: "Mitochondria", D: "Nucleus" },
    correctAnswer: "B",
    explanation: "Lysosomes are formed by the Golgi apparatus which packages hydrolytic enzymes into vesicles.",
    chapterId: 8, chapterName: "Cell – The Unit of Life", source: "PYQ", year: 2018
  },
  {
    id: 37,
    question: "Which cell organelle is known as the 'powerhouse of the cell'?",
    options: { A: "Chloroplast", B: "Golgi apparatus", C: "Mitochondria", D: "Endoplasmic reticulum" },
    correctAnswer: "C",
    explanation: "Mitochondria are the powerhouse of the cell, producing ATP through oxidative phosphorylation.",
    chapterId: 8, chapterName: "Cell – The Unit of Life", source: "NCERT"
  },
  {
    id: 38,
    question: "The fluid mosaic model of plasma membrane was proposed by:",
    options: { A: "Robertson", B: "Singer and Nicolson", C: "Danielli and Davson", D: "Watson and Crick" },
    correctAnswer: "B",
    explanation: "Singer and Nicolson proposed the fluid mosaic model in 1972, describing membrane as a fluid lipid bilayer with proteins.",
    chapterId: 8, chapterName: "Cell – The Unit of Life", source: "PYQ", year: 2020
  },
  {
    id: 39,
    question: "Ribosomes are the site of:",
    options: { A: "Respiration", B: "Photosynthesis", C: "Protein synthesis", D: "Lipid synthesis" },
    correctAnswer: "C",
    explanation: "Ribosomes are cellular organelles responsible for protein synthesis by translating mRNA.",
    chapterId: 8, chapterName: "Cell – The Unit of Life", source: "NCERT"
  },
  {
    id: 40,
    question: "Which organelle contains its own DNA?",
    options: { A: "Ribosome", B: "Lysosome", C: "Mitochondria", D: "Golgi apparatus" },
    correctAnswer: "C",
    explanation: "Mitochondria and chloroplasts contain their own circular DNA and ribosomes (semi-autonomous organelles).",
    chapterId: 8, chapterName: "Cell – The Unit of Life", source: "PYQ", year: 2019
  },

  // Chapter 9: Biomolecules (5 questions)
  {
    id: 41,
    question: "Which of the following is NOT a characteristic of enzymes?",
    options: { A: "They are proteins", B: "They increase activation energy", C: "They are specific in action", D: "They remain unchanged after reaction" },
    correctAnswer: "B",
    explanation: "Enzymes decrease activation energy, not increase it, thereby speeding up biochemical reactions.",
    chapterId: 9, chapterName: "Biomolecules", source: "NCERT"
  },
  {
    id: 42,
    question: "The most abundant protein in animal world is:",
    options: { A: "Collagen", B: "Insulin", C: "Hemoglobin", D: "Keratin" },
    correctAnswer: "A",
    explanation: "Collagen is the most abundant protein in animal kingdom, found in connective tissues, skin, bones.",
    chapterId: 9, chapterName: "Biomolecules", source: "PYQ", year: 2020
  },
  {
    id: 43,
    question: "Which polysaccharide is stored in animal cells?",
    options: { A: "Starch", B: "Cellulose", C: "Glycogen", D: "Chitin" },
    correctAnswer: "C",
    explanation: "Glycogen is the storage polysaccharide in animals, stored mainly in liver and muscle cells.",
    chapterId: 9, chapterName: "Biomolecules", source: "NCERT"
  },
  {
    id: 44,
    question: "Lipids are soluble in:",
    options: { A: "Water", B: "Dilute acids", C: "Organic solvents", D: "Dilute bases" },
    correctAnswer: "C",
    explanation: "Lipids are hydrophobic and soluble in organic solvents like ether, chloroform, and benzene.",
    chapterId: 9, chapterName: "Biomolecules", source: "PYQ", year: 2019
  },
  {
    id: 45,
    question: "DNA and RNA are polymers of:",
    options: { A: "Amino acids", B: "Nucleotides", C: "Fatty acids", D: "Monosaccharides" },
    correctAnswer: "B",
    explanation: "DNA and RNA are polynucleotides - polymers of nucleotides joined by phosphodiester bonds.",
    chapterId: 9, chapterName: "Biomolecules", source: "NCERT"
  },

  // Chapter 10: Cell Cycle and Cell Division (5 questions)
  {
    id: 46,
    question: "During which phase of cell cycle DNA replication occurs?",
    options: { A: "G1 phase", B: "S phase", C: "G2 phase", D: "M phase" },
    correctAnswer: "B",
    explanation: "S (synthesis) phase is when DNA replication occurs, doubling the DNA content of the cell.",
    chapterId: 10, chapterName: "Cell Cycle and Cell Division", source: "PYQ", year: 2021
  },
  {
    id: 47,
    question: "Crossing over occurs during:",
    options: { A: "Leptotene", B: "Zygotene", C: "Pachytene", D: "Diplotene" },
    correctAnswer: "C",
    explanation: "Crossing over (exchange of genetic material) occurs during pachytene stage of meiosis I prophase.",
    chapterId: 10, chapterName: "Cell Cycle and Cell Division", source: "NCERT"
  },
  {
    id: 48,
    question: "The number of chromosomes is reduced to half during:",
    options: { A: "Mitosis", B: "Meiosis I", C: "Meiosis II", D: "Amitosis" },
    correctAnswer: "B",
    explanation: "Meiosis I is reductional division where chromosome number is halved from 2n to n.",
    chapterId: 10, chapterName: "Cell Cycle and Cell Division", source: "PYQ", year: 2020
  },
  {
    id: 49,
    question: "Chiasmata are formed during:",
    options: { A: "Leptotene", B: "Pachytene", C: "Diplotene", D: "Diakinesis" },
    correctAnswer: "C",
    explanation: "Chiasmata (X-shaped structures) become visible during diplotene as evidence of crossing over.",
    chapterId: 10, chapterName: "Cell Cycle and Cell Division", source: "NCERT"
  },
  {
    id: 50,
    question: "Mitotic spindle is mainly composed of:",
    options: { A: "Actin", B: "Myosin", C: "Tubulin", D: "Keratin" },
    correctAnswer: "C",
    explanation: "Mitotic spindle fibers are made of tubulin protein, forming microtubules that separate chromosomes.",
    chapterId: 10, chapterName: "Cell Cycle and Cell Division", source: "PYQ", year: 2019
  },

  // Chapter 11: Transport in Plants (4 questions)
  {
    id: 51,
    question: "Water potential of pure water is:",
    options: { A: "Zero", B: "Positive", C: "Negative", D: "Variable" },
    correctAnswer: "A",
    explanation: "Water potential of pure water at standard temperature and pressure is zero (the reference point).",
    chapterId: 11, chapterName: "Transport in Plants", source: "NCERT"
  },
  {
    id: 52,
    question: "Root pressure is maximum during:",
    options: { A: "Day time", B: "Night time", C: "Morning", D: "Afternoon" },
    correctAnswer: "C",
    explanation: "Root pressure is maximum in early morning when transpiration is low and root absorption continues.",
    chapterId: 11, chapterName: "Transport in Plants", source: "PYQ", year: 2020
  },
  {
    id: 53,
    question: "Guttation occurs through:",
    options: { A: "Stomata", B: "Hydathodes", C: "Lenticels", D: "Cuticle" },
    correctAnswer: "B",
    explanation: "Guttation (loss of water droplets) occurs through hydathodes, specialized pores at leaf margins.",
    chapterId: 11, chapterName: "Transport in Plants", source: "NCERT"
  },
  {
    id: 54,
    question: "Transpiration pull theory was proposed by:",
    options: { A: "Dixon and Joly", B: "Munch", C: "Curtis", D: "Steward" },
    correctAnswer: "A",
    explanation: "Dixon and Joly proposed the cohesion-tension (transpiration pull) theory for water ascent.",
    chapterId: 11, chapterName: "Transport in Plants", source: "PYQ", year: 2019
  },

  // Chapter 12: Mineral Nutrition (4 questions)
  {
    id: 55,
    question: "Which element is essential for chlorophyll synthesis?",
    options: { A: "Calcium", B: "Magnesium", C: "Potassium", D: "Sulphur" },
    correctAnswer: "B",
    explanation: "Magnesium is a central atom in the chlorophyll molecule, essential for its synthesis.",
    chapterId: 12, chapterName: "Mineral Nutrition", source: "PYQ", year: 2021
  },
  {
    id: 56,
    question: "Nitrogen fixation is carried out by:",
    options: { A: "Rhizobium", B: "E. coli", C: "Saccharomyces", D: "Aspergillus" },
    correctAnswer: "A",
    explanation: "Rhizobium is a nitrogen-fixing bacterium forming symbiotic relationship with legume roots.",
    chapterId: 12, chapterName: "Mineral Nutrition", source: "NCERT"
  },
  {
    id: 57,
    question: "Deficiency of which element causes chlorosis?",
    options: { A: "Phosphorus", B: "Nitrogen", C: "Sulphur", D: "All of these" },
    correctAnswer: "D",
    explanation: "Chlorosis (yellowing of leaves) is caused by deficiency of N, Mg, Fe, S, Mn, Zn, or Mo.",
    chapterId: 12, chapterName: "Mineral Nutrition", source: "PYQ", year: 2020
  },
  {
    id: 58,
    question: "Nitrogenase enzyme requires which condition for activity?",
    options: { A: "Aerobic", B: "Anaerobic", C: "Light", D: "High temperature" },
    correctAnswer: "B",
    explanation: "Nitrogenase enzyme is oxygen-sensitive and requires anaerobic conditions for nitrogen fixation.",
    chapterId: 12, chapterName: "Mineral Nutrition", source: "NCERT"
  },

  // Chapter 13: Photosynthesis in Higher Plants (5 questions)
  {
    id: 59,
    question: "During photosynthesis, oxygen is released from:",
    options: { A: "Carbon dioxide", B: "Water", C: "Glucose", D: "Chlorophyll" },
    correctAnswer: "B",
    explanation: "Oxygen released during photosynthesis comes from water molecules during photolysis in light reaction.",
    chapterId: 13, chapterName: "Photosynthesis in Higher Plants", source: "PYQ", year: 2021
  },
  {
    id: 60,
    question: "The first stable product of C3 cycle is:",
    options: { A: "PGA", B: "OAA", C: "RuBP", D: "Glucose" },
    correctAnswer: "A",
    explanation: "3-phosphoglyceric acid (3-PGA) is the first stable 3-carbon product of Calvin cycle (C3 pathway).",
    chapterId: 13, chapterName: "Photosynthesis in Higher Plants", source: "NCERT"
  },
  {
    id: 61,
    question: "Photorespiration occurs in:",
    options: { A: "C3 plants", B: "C4 plants", C: "CAM plants", D: "All plants" },
    correctAnswer: "A",
    explanation: "Photorespiration is significant in C3 plants due to oxygenase activity of RuBisCO in high O2/low CO2.",
    chapterId: 13, chapterName: "Photosynthesis in Higher Plants", source: "PYQ", year: 2020
  },
  {
    id: 62,
    question: "Kranz anatomy is characteristic of:",
    options: { A: "C3 plants", B: "C4 plants", C: "CAM plants", D: "All plants" },
    correctAnswer: "B",
    explanation: "Kranz anatomy (bundle sheath with chloroplasts) is characteristic of C4 plants like maize, sugarcane.",
    chapterId: 13, chapterName: "Photosynthesis in Higher Plants", source: "NCERT"
  },
  {
    id: 63,
    question: "Which pigment absorbs maximum light in red region?",
    options: { A: "Chlorophyll a", B: "Chlorophyll b", C: "Carotenoids", D: "Xanthophylls" },
    correctAnswer: "A",
    explanation: "Chlorophyll a shows maximum absorption in red (around 680nm) and blue (around 430nm) regions.",
    chapterId: 13, chapterName: "Photosynthesis in Higher Plants", source: "PYQ", year: 2019
  },

  // Chapter 14: Respiration in Plants (5 questions)
  {
    id: 64,
    question: "The total number of ATP molecules produced from one glucose in aerobic respiration is:",
    options: { A: "2", B: "36-38", C: "24", D: "12" },
    correctAnswer: "B",
    explanation: "Aerobic respiration produces 36-38 ATP: 2 from glycolysis, 2 from Krebs, 32-34 from ETC.",
    chapterId: 14, chapterName: "Respiration in Plants", source: "PYQ", year: 2018
  },
  {
    id: 65,
    question: "Glycolysis occurs in:",
    options: { A: "Mitochondria", B: "Cytoplasm", C: "Chloroplast", D: "Nucleus" },
    correctAnswer: "B",
    explanation: "Glycolysis occurs in the cytoplasm, converting glucose to pyruvate without requiring oxygen.",
    chapterId: 14, chapterName: "Respiration in Plants", source: "NCERT"
  },
  {
    id: 66,
    question: "RQ value for carbohydrates is:",
    options: { A: "Less than 1", B: "More than 1", C: "Equal to 1", D: "Zero" },
    correctAnswer: "C",
    explanation: "Respiratory Quotient (CO2 released/O2 consumed) for carbohydrates is 1 due to balanced oxidation.",
    chapterId: 14, chapterName: "Respiration in Plants", source: "PYQ", year: 2020
  },
  {
    id: 67,
    question: "Krebs cycle occurs in:",
    options: { A: "Cytoplasm", B: "Mitochondrial matrix", C: "Inner membrane", D: "Outer membrane" },
    correctAnswer: "B",
    explanation: "Krebs cycle (citric acid cycle) occurs in the mitochondrial matrix, oxidizing acetyl CoA.",
    chapterId: 14, chapterName: "Respiration in Plants", source: "NCERT"
  },
  {
    id: 68,
    question: "Fermentation produces:",
    options: { A: "36 ATP", B: "38 ATP", C: "2 ATP", D: "4 ATP" },
    correctAnswer: "C",
    explanation: "Fermentation (anaerobic) produces only 2 ATP per glucose from glycolysis, no ETC involvement.",
    chapterId: 14, chapterName: "Respiration in Plants", source: "PYQ", year: 2019
  },

  // Chapter 15: Plant Growth and Development (4 questions)
  {
    id: 69,
    question: "Which hormone promotes cell elongation?",
    options: { A: "Auxin", B: "Cytokinin", C: "Abscisic acid", D: "Ethylene" },
    correctAnswer: "A",
    explanation: "Auxin promotes cell elongation by acidifying cell wall and activating expansins.",
    chapterId: 15, chapterName: "Plant Growth and Development", source: "PYQ", year: 2021
  },
  {
    id: 70,
    question: "Bolting is promoted by:",
    options: { A: "Auxin", B: "Gibberellin", C: "Cytokinin", D: "ABA" },
    correctAnswer: "B",
    explanation: "Gibberellins promote bolting (internode elongation) in rosette plants before flowering.",
    chapterId: 15, chapterName: "Plant Growth and Development", source: "NCERT"
  },
  {
    id: 71,
    question: "Which hormone is known as 'stress hormone'?",
    options: { A: "Auxin", B: "Gibberellin", C: "Abscisic acid", D: "Ethylene" },
    correctAnswer: "C",
    explanation: "Abscisic acid (ABA) is called stress hormone as it helps plants respond to drought and other stresses.",
    chapterId: 15, chapterName: "Plant Growth and Development", source: "PYQ", year: 2020
  },
  {
    id: 72,
    question: "Phytochrome is involved in:",
    options: { A: "Photosynthesis", B: "Photoperiodism", C: "Respiration", D: "Transpiration" },
    correctAnswer: "B",
    explanation: "Phytochrome is a photoreceptor pigment involved in photoperiodism, seed germination, and flowering.",
    chapterId: 15, chapterName: "Plant Growth and Development", source: "NCERT"
  },

  // Chapter 16: Digestion and Absorption (4 questions)
  {
    id: 73,
    question: "Pepsin acts on:",
    options: { A: "Carbohydrates", B: "Proteins", C: "Fats", D: "Nucleic acids" },
    correctAnswer: "B",
    explanation: "Pepsin is a gastric enzyme that digests proteins into peptones in acidic pH of stomach.",
    chapterId: 16, chapterName: "Digestion and Absorption", source: "PYQ", year: 2020
  },
  {
    id: 74,
    question: "Bile is produced by:",
    options: { A: "Gall bladder", B: "Liver", C: "Pancreas", D: "Stomach" },
    correctAnswer: "B",
    explanation: "Bile is produced by liver and stored in gall bladder; it emulsifies fats for digestion.",
    chapterId: 16, chapterName: "Digestion and Absorption", source: "NCERT"
  },
  {
    id: 75,
    question: "Maximum absorption of digested food occurs in:",
    options: { A: "Stomach", B: "Small intestine", C: "Large intestine", D: "Mouth" },
    correctAnswer: "B",
    explanation: "Small intestine is the main site of absorption due to villi and microvilli increasing surface area.",
    chapterId: 16, chapterName: "Digestion and Absorption", source: "PYQ", year: 2019
  },
  {
    id: 76,
    question: "Enterokinase activates:",
    options: { A: "Pepsinogen", B: "Trypsinogen", C: "Lipase", D: "Amylase" },
    correctAnswer: "B",
    explanation: "Enterokinase (enteropeptidase) activates trypsinogen to trypsin in the small intestine.",
    chapterId: 16, chapterName: "Digestion and Absorption", source: "NCERT"
  },

  // Chapter 17: Breathing and Exchange of Gases (4 questions)
  {
    id: 77,
    question: "Oxygen is transported mainly as:",
    options: { A: "Dissolved in plasma", B: "Oxyhemoglobin", C: "Carbaminohemoglobin", D: "Bicarbonates" },
    correctAnswer: "B",
    explanation: "About 97% of oxygen is transported as oxyhemoglobin (bound to hemoglobin in RBCs).",
    chapterId: 17, chapterName: "Breathing and Exchange of Gases", source: "PYQ", year: 2021
  },
  {
    id: 78,
    question: "The respiratory centre is located in:",
    options: { A: "Cerebrum", B: "Cerebellum", C: "Medulla oblongata", D: "Pons" },
    correctAnswer: "C",
    explanation: "The primary respiratory center controlling breathing rhythm is in the medulla oblongata.",
    chapterId: 17, chapterName: "Breathing and Exchange of Gases", source: "NCERT"
  },
  {
    id: 79,
    question: "Bohr effect relates to:",
    options: { A: "CO2 on O2 binding", B: "O2 on CO2 binding", C: "pH on breathing", D: "Temperature on respiration" },
    correctAnswer: "A",
    explanation: "Bohr effect: increased CO2/decreased pH reduces hemoglobin's affinity for oxygen (shifts curve right).",
    chapterId: 17, chapterName: "Breathing and Exchange of Gases", source: "PYQ", year: 2020
  },
  {
    id: 80,
    question: "Vital capacity is:",
    options: { A: "TV + IRV", B: "TV + ERV", C: "TV + IRV + ERV", D: "TV + IRV + ERV + RV" },
    correctAnswer: "C",
    explanation: "Vital capacity = Tidal Volume + Inspiratory Reserve Volume + Expiratory Reserve Volume.",
    chapterId: 17, chapterName: "Breathing and Exchange of Gases", source: "NCERT"
  },

  // Chapter 18: Body Fluids and Circulation (4 questions)
  {
    id: 81,
    question: "Pacemaker of the heart is:",
    options: { A: "SA node", B: "AV node", C: "Bundle of His", D: "Purkinje fibers" },
    correctAnswer: "A",
    explanation: "SA (sinoatrial) node is the pacemaker, generating impulses that initiate each heartbeat.",
    chapterId: 18, chapterName: "Body Fluids and Circulation", source: "PYQ", year: 2021
  },
  {
    id: 82,
    question: "Which blood cells are involved in blood clotting?",
    options: { A: "RBC", B: "WBC", C: "Platelets", D: "Lymphocytes" },
    correctAnswer: "C",
    explanation: "Platelets (thrombocytes) are cell fragments essential for blood clotting through thrombus formation.",
    chapterId: 18, chapterName: "Body Fluids and Circulation", source: "NCERT"
  },
  {
    id: 83,
    question: "Double circulation is found in:",
    options: { A: "Fish", B: "Frog", C: "Birds", D: "Lizard" },
    correctAnswer: "C",
    explanation: "Birds (and mammals) have complete double circulation with separate pulmonary and systemic circuits.",
    chapterId: 18, chapterName: "Body Fluids and Circulation", source: "PYQ", year: 2020
  },
  {
    id: 84,
    question: "Universal donor blood group is:",
    options: { A: "A", B: "B", C: "AB", D: "O" },
    correctAnswer: "D",
    explanation: "Blood group O is universal donor (no antigens on RBC surface, can donate to all groups).",
    chapterId: 18, chapterName: "Body Fluids and Circulation", source: "NCERT"
  },

  // Chapter 19: Excretory Products and their Elimination (4 questions)
  {
    id: 85,
    question: "The functional unit of kidney is:",
    options: { A: "Neuron", B: "Nephron", C: "Glomerulus", D: "Bowman's capsule" },
    correctAnswer: "B",
    explanation: "Nephron is the structural and functional unit of kidney, responsible for urine formation.",
    chapterId: 19, chapterName: "Excretory Products and their Elimination", source: "PYQ", year: 2021
  },
  {
    id: 86,
    question: "ADH is secreted by:",
    options: { A: "Anterior pituitary", B: "Posterior pituitary", C: "Adrenal cortex", D: "Thyroid" },
    correctAnswer: "B",
    explanation: "ADH (antidiuretic hormone) is released from posterior pituitary, promoting water reabsorption in kidney.",
    chapterId: 19, chapterName: "Excretory Products and their Elimination", source: "NCERT"
  },
  {
    id: 87,
    question: "Glomerular filtration rate (GFR) is approximately:",
    options: { A: "25 mL/min", B: "125 mL/min", C: "225 mL/min", D: "325 mL/min" },
    correctAnswer: "B",
    explanation: "GFR is approximately 125 mL/min (180 liters/day), measuring kidney filtration efficiency.",
    chapterId: 19, chapterName: "Excretory Products and their Elimination", source: "PYQ", year: 2020
  },
  {
    id: 88,
    question: "Urea is synthesized in:",
    options: { A: "Kidney", B: "Liver", C: "Spleen", D: "Intestine" },
    correctAnswer: "B",
    explanation: "Urea is synthesized in liver through the urea cycle (ornithine cycle) from ammonia.",
    chapterId: 19, chapterName: "Excretory Products and their Elimination", source: "NCERT"
  },

  // Chapter 20: Locomotion and Movement (4 questions)
  {
    id: 89,
    question: "The contractile protein of muscle is:",
    options: { A: "Myoglobin", B: "Actin and Myosin", C: "Collagen", D: "Elastin" },
    correctAnswer: "B",
    explanation: "Actin (thin filament) and myosin (thick filament) are contractile proteins causing muscle contraction.",
    chapterId: 20, chapterName: "Locomotion and Movement", source: "PYQ", year: 2020
  },
  {
    id: 90,
    question: "The functional unit of muscle contraction is:",
    options: { A: "Myofibril", B: "Sarcomere", C: "Muscle fiber", D: "Fascicle" },
    correctAnswer: "B",
    explanation: "Sarcomere (region between two Z-lines) is the functional unit of muscle contraction.",
    chapterId: 20, chapterName: "Locomotion and Movement", source: "NCERT"
  },
  {
    id: 91,
    question: "Ball and socket joint is found in:",
    options: { A: "Knee", B: "Elbow", C: "Shoulder", D: "Wrist" },
    correctAnswer: "C",
    explanation: "Ball and socket joint (allows movement in all directions) is found in shoulder and hip.",
    chapterId: 20, chapterName: "Locomotion and Movement", source: "PYQ", year: 2019
  },
  {
    id: 92,
    question: "Which ion is essential for muscle contraction?",
    options: { A: "Sodium", B: "Potassium", C: "Calcium", D: "Chloride" },
    correctAnswer: "C",
    explanation: "Calcium ions trigger muscle contraction by binding to troponin, exposing myosin binding sites.",
    chapterId: 20, chapterName: "Locomotion and Movement", source: "NCERT"
  },

  // Chapter 21: Neural Control and Coordination (5 questions)
  {
    id: 93,
    question: "The gap between two neurons is called:",
    options: { A: "Synapse", B: "Dendrite", C: "Axon", D: "Neurilemma" },
    correctAnswer: "A",
    explanation: "Synapse is the junction between two neurons where nerve impulses are transmitted chemically.",
    chapterId: 21, chapterName: "Neural Control and Coordination", source: "PYQ", year: 2021
  },
  {
    id: 94,
    question: "Cerebellum controls:",
    options: { A: "Intelligence", B: "Balance and posture", C: "Emotions", D: "Sleep" },
    correctAnswer: "B",
    explanation: "Cerebellum coordinates muscular activity, maintains balance, posture, and equilibrium.",
    chapterId: 21, chapterName: "Neural Control and Coordination", source: "NCERT"
  },
  {
    id: 95,
    question: "Which part of brain is associated with memory?",
    options: { A: "Cerebellum", B: "Hypothalamus", C: "Cerebrum", D: "Medulla" },
    correctAnswer: "C",
    explanation: "Cerebrum (especially hippocampus) is associated with memory, learning, and higher mental functions.",
    chapterId: 21, chapterName: "Neural Control and Coordination", source: "PYQ", year: 2020
  },
  {
    id: 96,
    question: "Resting membrane potential is mainly due to:",
    options: { A: "Na+ efflux", B: "K+ efflux", C: "Cl- influx", D: "Ca2+ influx" },
    correctAnswer: "B",
    explanation: "Resting membrane potential (-70mV) is mainly due to K+ efflux through leak channels.",
    chapterId: 21, chapterName: "Neural Control and Coordination", source: "NCERT"
  },
  {
    id: 97,
    question: "Reflex arc consists of:",
    options: { A: "Receptor → Sensory neuron → CNS → Motor neuron → Effector", B: "Effector → Motor neuron → CNS → Sensory neuron → Receptor", C: "CNS → Receptor → Effector", D: "Receptor → Effector → CNS" },
    correctAnswer: "A",
    explanation: "Reflex arc: Receptor → Afferent (sensory) neuron → CNS → Efferent (motor) neuron → Effector.",
    chapterId: 21, chapterName: "Neural Control and Coordination", source: "PYQ", year: 2019
  },

  // Chapter 22: Chemical Coordination and Integration (5 questions)
  {
    id: 98,
    question: "Which hormone is responsible for the 'fight or flight' response?",
    options: { A: "Insulin", B: "Thyroxine", C: "Adrenaline", D: "Melatonin" },
    correctAnswer: "C",
    explanation: "Adrenaline (epinephrine) from adrenal medulla prepares body for emergency 'fight or flight' response.",
    chapterId: 22, chapterName: "Chemical Coordination and Integration", source: "NCERT"
  },
  {
    id: 99,
    question: "Diabetes mellitus is caused by deficiency of:",
    options: { A: "Thyroxine", B: "Insulin", C: "Glucagon", D: "Cortisol" },
    correctAnswer: "B",
    explanation: "Diabetes mellitus results from insulin deficiency/resistance, causing high blood glucose levels.",
    chapterId: 22, chapterName: "Chemical Coordination and Integration", source: "PYQ", year: 2021
  },
  {
    id: 100,
    question: "Thyroid gland secretes:",
    options: { A: "Insulin", B: "Thyroxine", C: "Adrenaline", D: "Testosterone" },
    correctAnswer: "B",
    explanation: "Thyroid gland secretes T3, T4 (thyroxine), and calcitonin, regulating metabolism and calcium levels.",
    chapterId: 22, chapterName: "Chemical Coordination and Integration", source: "NCERT"
  },
  {
    id: 101,
    question: "Growth hormone is secreted by:",
    options: { A: "Thyroid", B: "Adrenal", C: "Pituitary", D: "Pancreas" },
    correctAnswer: "C",
    explanation: "Growth hormone (somatotropin) is secreted by anterior pituitary, promoting growth and development.",
    chapterId: 22, chapterName: "Chemical Coordination and Integration", source: "PYQ", year: 2020
  },
  {
    id: 102,
    question: "Which hormone regulates circadian rhythm?",
    options: { A: "Melatonin", B: "Cortisol", C: "Thyroxine", D: "Insulin" },
    correctAnswer: "A",
    explanation: "Melatonin from pineal gland regulates sleep-wake cycle (circadian rhythm), highest at night.",
    chapterId: 22, chapterName: "Chemical Coordination and Integration", source: "NCERT"
  },

  // ============ CLASS 12 CHAPTERS ============

  // Chapter 23: Reproduction in Organisms (4 questions)
  {
    id: 103,
    question: "Binary fission is a type of:",
    options: { A: "Sexual reproduction", B: "Asexual reproduction", C: "Vegetative propagation", D: "Fragmentation" },
    correctAnswer: "B",
    explanation: "Binary fission is asexual reproduction where one cell divides into two identical daughter cells.",
    chapterId: 23, chapterName: "Reproduction in Organisms", source: "NCERT"
  },
  {
    id: 104,
    question: "External fertilization occurs in:",
    options: { A: "Humans", B: "Frogs", C: "Birds", D: "Reptiles" },
    correctAnswer: "B",
    explanation: "External fertilization (fusion of gametes outside body) occurs in frogs, fish, and most aquatic animals.",
    chapterId: 23, chapterName: "Reproduction in Organisms", source: "PYQ", year: 2020
  },
  {
    id: 105,
    question: "Meiosis occurs during:",
    options: { A: "Mitotic division", B: "Gamete formation", C: "Growth", D: "Repair" },
    correctAnswer: "B",
    explanation: "Meiosis occurs during gametogenesis to produce haploid gametes from diploid germ cells.",
    chapterId: 23, chapterName: "Reproduction in Organisms", source: "NCERT"
  },
  {
    id: 106,
    question: "Vegetative propagation in potato occurs through:",
    options: { A: "Stem tuber", B: "Root tuber", C: "Bulb", D: "Rhizome" },
    correctAnswer: "A",
    explanation: "Potato reproduces vegetatively through stem tubers bearing eyes (nodes with buds).",
    chapterId: 23, chapterName: "Reproduction in Organisms", source: "PYQ", year: 2019
  },

  // Chapter 24: Sexual Reproduction in Flowering Plants (5 questions)
  {
    id: 107,
    question: "Pollen grains are produced in:",
    options: { A: "Stigma", B: "Anther", C: "Ovary", D: "Style" },
    correctAnswer: "B",
    explanation: "Pollen grains (male gametophytes) are produced in anther through microsporogenesis.",
    chapterId: 24, chapterName: "Sexual Reproduction in Flowering Plants", source: "NCERT"
  },
  {
    id: 108,
    question: "Double fertilization involves fusion of:",
    options: { A: "One sperm with egg", B: "Two sperms with two eggs", C: "One sperm with egg and one with polar nuclei", D: "One sperm with synergids" },
    correctAnswer: "C",
    explanation: "Double fertilization: one sperm + egg = zygote; another sperm + polar nuclei = triploid endosperm.",
    chapterId: 24, chapterName: "Sexual Reproduction in Flowering Plants", source: "PYQ", year: 2021
  },
  {
    id: 109,
    question: "Embryo sac is also called:",
    options: { A: "Megaspore", B: "Female gametophyte", C: "Microspore", D: "Pollen grain" },
    correctAnswer: "B",
    explanation: "Embryo sac (7-celled, 8-nucleate structure) is the female gametophyte in angiosperms.",
    chapterId: 24, chapterName: "Sexual Reproduction in Flowering Plants", source: "NCERT"
  },
  {
    id: 110,
    question: "Endosperm is:",
    options: { A: "Haploid", B: "Diploid", C: "Triploid", D: "Tetraploid" },
    correctAnswer: "C",
    explanation: "Endosperm is triploid (3n), formed by fusion of two polar nuclei (2n) with one sperm (n).",
    chapterId: 24, chapterName: "Sexual Reproduction in Flowering Plants", source: "PYQ", year: 2020
  },
  {
    id: 111,
    question: "Self-incompatibility prevents:",
    options: { A: "Cross pollination", B: "Self pollination", C: "Fertilization after self pollination", D: "Seed formation" },
    correctAnswer: "C",
    explanation: "Self-incompatibility is a genetic mechanism preventing self-fertilization after self-pollination.",
    chapterId: 24, chapterName: "Sexual Reproduction in Flowering Plants", source: "NCERT"
  },

  // Chapter 25: Human Reproduction (5 questions)
  {
    id: 112,
    question: "Spermatogenesis occurs in:",
    options: { A: "Epididymis", B: "Vas deferens", C: "Seminiferous tubules", D: "Prostate gland" },
    correctAnswer: "C",
    explanation: "Spermatogenesis (sperm formation) occurs in seminiferous tubules of testes.",
    chapterId: 25, chapterName: "Human Reproduction", source: "PYQ", year: 2021
  },
  {
    id: 113,
    question: "Fertilization in humans occurs in:",
    options: { A: "Uterus", B: "Ovary", C: "Fallopian tube", D: "Vagina" },
    correctAnswer: "C",
    explanation: "Fertilization occurs in the ampulla (ampullary-isthmic junction) of the fallopian tube.",
    chapterId: 25, chapterName: "Human Reproduction", source: "NCERT"
  },
  {
    id: 114,
    question: "Implantation of embryo occurs in:",
    options: { A: "Ovary", B: "Fallopian tube", C: "Uterus", D: "Cervix" },
    correctAnswer: "C",
    explanation: "Implantation of blastocyst occurs in the endometrium (uterine wall) about 7 days after fertilization.",
    chapterId: 25, chapterName: "Human Reproduction", source: "PYQ", year: 2020
  },
  {
    id: 115,
    question: "The hormone responsible for ovulation is:",
    options: { A: "FSH", B: "LH", C: "Estrogen", D: "Progesterone" },
    correctAnswer: "B",
    explanation: "LH surge triggers ovulation (release of secondary oocyte from Graafian follicle) around day 14.",
    chapterId: 25, chapterName: "Human Reproduction", source: "NCERT"
  },
  {
    id: 116,
    question: "Placenta produces which hormone?",
    options: { A: "FSH", B: "LH", C: "hCG", D: "ADH" },
    correctAnswer: "C",
    explanation: "Placenta produces hCG (human chorionic gonadotropin), detected in pregnancy tests.",
    chapterId: 25, chapterName: "Human Reproduction", source: "PYQ", year: 2019
  },

  // Chapter 26: Reproductive Health (4 questions)
  {
    id: 117,
    question: "Which is a permanent method of contraception in males?",
    options: { A: "Condom", B: "Vasectomy", C: "Tubectomy", D: "IUD" },
    correctAnswer: "B",
    explanation: "Vasectomy is surgical cutting of vas deferens, a permanent contraceptive method for males.",
    chapterId: 26, chapterName: "Reproductive Health", source: "NCERT"
  },
  {
    id: 118,
    question: "MTP stands for:",
    options: { A: "Medical Termination of Pregnancy", B: "Medical Treatment of Pregnancy", C: "Maternal Transfer of Placenta", D: "None" },
    correctAnswer: "A",
    explanation: "MTP (Medical Termination of Pregnancy) is intentional termination, legal up to 24 weeks in India.",
    chapterId: 26, chapterName: "Reproductive Health", source: "PYQ", year: 2020
  },
  {
    id: 119,
    question: "IVF stands for:",
    options: { A: "Internal Vital Fertilization", B: "In Vitro Fertilization", C: "In Vivo Fertilization", D: "Internal Vaginal Fertilization" },
    correctAnswer: "B",
    explanation: "IVF (In Vitro Fertilization) is fertilization outside body in lab conditions, then embryo transfer.",
    chapterId: 26, chapterName: "Reproductive Health", source: "NCERT"
  },
  {
    id: 120,
    question: "AIDS is caused by:",
    options: { A: "Bacteria", B: "Virus", C: "Fungus", D: "Protozoa" },
    correctAnswer: "B",
    explanation: "AIDS is caused by HIV (Human Immunodeficiency Virus), attacking helper T-lymphocytes.",
    chapterId: 26, chapterName: "Reproductive Health", source: "PYQ", year: 2021
  },

  // Chapter 27: Principles of Inheritance and Variation (5 questions)
  {
    id: 121,
    question: "The law of segregation is also known as:",
    options: { A: "Law of dominance", B: "Law of purity of gametes", C: "Law of independent assortment", D: "Law of linkage" },
    correctAnswer: "B",
    explanation: "Law of segregation = Law of purity of gametes: alleles segregate so each gamete gets one allele.",
    chapterId: 27, chapterName: "Principles of Inheritance and Variation", source: "PYQ", year: 2020
  },
  {
    id: 122,
    question: "In a dihybrid cross, the phenotypic ratio in F2 generation is:",
    options: { A: "3:1", B: "1:2:1", C: "9:3:3:1", D: "1:1:1:1" },
    correctAnswer: "C",
    explanation: "Dihybrid cross F2 ratio is 9:3:3:1 due to independent assortment of two gene pairs.",
    chapterId: 27, chapterName: "Principles of Inheritance and Variation", source: "NCERT"
  },
  {
    id: 123,
    question: "Sex determination in humans is:",
    options: { A: "XX-XO type", B: "XX-XY type", C: "ZZ-ZW type", D: "Haplodiploidy" },
    correctAnswer: "B",
    explanation: "Humans have XX-XY sex determination: females are XX, males are XY.",
    chapterId: 27, chapterName: "Principles of Inheritance and Variation", source: "PYQ", year: 2019
  },
  {
    id: 124,
    question: "Color blindness is:",
    options: { A: "Autosomal dominant", B: "Autosomal recessive", C: "X-linked recessive", D: "Y-linked" },
    correctAnswer: "C",
    explanation: "Color blindness is X-linked recessive, more common in males who have only one X chromosome.",
    chapterId: 27, chapterName: "Principles of Inheritance and Variation", source: "NCERT"
  },
  {
    id: 125,
    question: "Blood group inheritance is an example of:",
    options: { A: "Dominance", B: "Codominance", C: "Incomplete dominance", D: "Epistasis" },
    correctAnswer: "B",
    explanation: "ABO blood groups show codominance (A and B are codominant) and multiple alleles (IA, IB, i).",
    chapterId: 27, chapterName: "Principles of Inheritance and Variation", source: "PYQ", year: 2021
  },

  // Chapter 28: Molecular Basis of Inheritance (5 questions)
  {
    id: 126,
    question: "The process of copying genetic information from DNA to RNA is:",
    options: { A: "Translation", B: "Transcription", C: "Replication", D: "Transduction" },
    correctAnswer: "B",
    explanation: "Transcription is synthesis of RNA from DNA template, catalyzed by RNA polymerase.",
    chapterId: 28, chapterName: "Molecular Basis of Inheritance", source: "PYQ", year: 2019
  },
  {
    id: 127,
    question: "DNA replication is:",
    options: { A: "Conservative", B: "Semi-conservative", C: "Dispersive", D: "Non-conservative" },
    correctAnswer: "B",
    explanation: "DNA replication is semi-conservative: each new DNA has one old and one new strand (Meselson-Stahl).",
    chapterId: 28, chapterName: "Molecular Basis of Inheritance", source: "PYQ", year: 2020
  },
  {
    id: 128,
    question: "Okazaki fragments are formed during:",
    options: { A: "Transcription", B: "Translation", C: "DNA replication", D: "Reverse transcription" },
    correctAnswer: "C",
    explanation: "Okazaki fragments are short DNA segments synthesized on lagging strand during replication.",
    chapterId: 28, chapterName: "Molecular Basis of Inheritance", source: "NCERT"
  },
  {
    id: 129,
    question: "The enzyme that joins Okazaki fragments is:",
    options: { A: "DNA polymerase", B: "DNA ligase", C: "Helicase", D: "Primase" },
    correctAnswer: "B",
    explanation: "DNA ligase joins Okazaki fragments by forming phosphodiester bonds between them.",
    chapterId: 28, chapterName: "Molecular Basis of Inheritance", source: "PYQ", year: 2018
  },
  {
    id: 130,
    question: "Central dogma of molecular biology is:",
    options: { A: "DNA → RNA → Protein", B: "RNA → DNA → Protein", C: "Protein → RNA → DNA", D: "DNA → Protein → RNA" },
    correctAnswer: "A",
    explanation: "Central dogma: genetic information flows from DNA → RNA (transcription) → Protein (translation).",
    chapterId: 28, chapterName: "Molecular Basis of Inheritance", source: "NCERT"
  },

  // Chapter 29: Evolution (5 questions)
  {
    id: 131,
    question: "Darwin's theory of natural selection is based on:",
    options: { A: "Survival of the fittest", B: "Inheritance of acquired characters", C: "Mutation", D: "Genetic drift" },
    correctAnswer: "A",
    explanation: "Darwin's natural selection: organisms with favorable variations survive and reproduce (survival of fittest).",
    chapterId: 29, chapterName: "Evolution", source: "PYQ", year: 2021
  },
  {
    id: 132,
    question: "Homologous organs show:",
    options: { A: "Same function, different origin", B: "Same origin, different function", C: "Same function, same origin", D: "Different function, different origin" },
    correctAnswer: "B",
    explanation: "Homologous organs have same origin (anatomy) but different functions - evidence of divergent evolution.",
    chapterId: 29, chapterName: "Evolution", source: "NCERT"
  },
  {
    id: 133,
    question: "Miller-Urey experiment demonstrated:",
    options: { A: "Origin of life", B: "Abiotic synthesis of organic molecules", C: "Evolution of humans", D: "Mutation" },
    correctAnswer: "B",
    explanation: "Miller-Urey experiment showed abiotic synthesis of amino acids from inorganic molecules.",
    chapterId: 29, chapterName: "Evolution", source: "PYQ", year: 2020
  },
  {
    id: 134,
    question: "Hardy-Weinberg equilibrium is disturbed by:",
    options: { A: "Random mating", B: "Large population", C: "Gene flow", D: "No mutation" },
    correctAnswer: "C",
    explanation: "Gene flow, genetic drift, mutation, selection, and non-random mating disturb Hardy-Weinberg equilibrium.",
    chapterId: 29, chapterName: "Evolution", source: "NCERT"
  },
  {
    id: 135,
    question: "Industrial melanism is an example of:",
    options: { A: "Natural selection", B: "Genetic drift", C: "Gene flow", D: "Mutation" },
    correctAnswer: "A",
    explanation: "Industrial melanism (peppered moth) demonstrates natural selection favoring dark moths in polluted areas.",
    chapterId: 29, chapterName: "Evolution", source: "PYQ", year: 2019
  },

  // Chapter 30: Human Health and Disease (5 questions)
  {
    id: 136,
    question: "Malaria is caused by:",
    options: { A: "Virus", B: "Bacteria", C: "Protozoan", D: "Fungus" },
    correctAnswer: "C",
    explanation: "Malaria is caused by Plasmodium (protozoan), transmitted by female Anopheles mosquito.",
    chapterId: 30, chapterName: "Human Health and Disease", source: "PYQ", year: 2021
  },
  {
    id: 137,
    question: "Which cells are affected by HIV?",
    options: { A: "RBC", B: "Platelets", C: "Helper T-cells", D: "B-cells" },
    correctAnswer: "C",
    explanation: "HIV attacks helper T-lymphocytes (CD4+ cells), weakening immune system leading to AIDS.",
    chapterId: 30, chapterName: "Human Health and Disease", source: "NCERT"
  },
  {
    id: 138,
    question: "Antibodies are produced by:",
    options: { A: "T-lymphocytes", B: "B-lymphocytes", C: "Neutrophils", D: "Macrophages" },
    correctAnswer: "B",
    explanation: "B-lymphocytes (plasma cells) produce antibodies (immunoglobulins) for humoral immunity.",
    chapterId: 30, chapterName: "Human Health and Disease", source: "PYQ", year: 2020
  },
  {
    id: 139,
    question: "Interferon is:",
    options: { A: "Antibody", B: "Antiviral protein", C: "Bacteria", D: "Toxin" },
    correctAnswer: "B",
    explanation: "Interferons are antiviral proteins produced by virus-infected cells to protect other cells.",
    chapterId: 30, chapterName: "Human Health and Disease", source: "NCERT"
  },
  {
    id: 140,
    question: "Typhoid is caused by:",
    options: { A: "Salmonella typhi", B: "Vibrio cholerae", C: "Streptococcus", D: "Plasmodium" },
    correctAnswer: "A",
    explanation: "Typhoid fever is caused by Salmonella typhi bacteria, transmitted through contaminated food/water.",
    chapterId: 30, chapterName: "Human Health and Disease", source: "PYQ", year: 2019
  },

  // Chapter 31: Strategies for Enhancement in Food Production (4 questions)
  {
    id: 141,
    question: "Green revolution is related to:",
    options: { A: "Milk production", B: "Fish production", C: "Wheat and rice production", D: "Poultry" },
    correctAnswer: "C",
    explanation: "Green revolution (1960s) dramatically increased wheat and rice production through HYV seeds.",
    chapterId: 31, chapterName: "Strategies for Enhancement in Food Production", source: "NCERT"
  },
  {
    id: 142,
    question: "MOET stands for:",
    options: { A: "Multiple Ovulation Embryo Transfer", B: "Multiple Organism Embryo Treatment", C: "Mutual Ovulation Embryo Transfer", D: "None" },
    correctAnswer: "A",
    explanation: "MOET (Multiple Ovulation Embryo Transfer) is used to increase cattle herd with superior genetics.",
    chapterId: 31, chapterName: "Strategies for Enhancement in Food Production", source: "PYQ", year: 2020
  },
  {
    id: 143,
    question: "Apiculture is rearing of:",
    options: { A: "Fish", B: "Silk worm", C: "Honey bees", D: "Prawns" },
    correctAnswer: "C",
    explanation: "Apiculture is scientific rearing of honey bees for honey and beeswax production.",
    chapterId: 31, chapterName: "Strategies for Enhancement in Food Production", source: "NCERT"
  },
  {
    id: 144,
    question: "Somatic hybridization involves fusion of:",
    options: { A: "Gametes", B: "Protoplasts", C: "Nuclei only", D: "Chromosomes" },
    correctAnswer: "B",
    explanation: "Somatic hybridization involves fusion of protoplasts (cells without cell wall) from different species.",
    chapterId: 31, chapterName: "Strategies for Enhancement in Food Production", source: "PYQ", year: 2019
  },

  // Chapter 32: Microbes in Human Welfare (4 questions)
  {
    id: 145,
    question: "Lactobacillus is used in production of:",
    options: { A: "Bread", B: "Curd", C: "Alcohol", D: "Vinegar" },
    correctAnswer: "B",
    explanation: "Lactobacillus converts milk lactose to lactic acid, producing curd/yogurt.",
    chapterId: 32, chapterName: "Microbes in Human Welfare", source: "PYQ", year: 2021
  },
  {
    id: 146,
    question: "Penicillin was discovered by:",
    options: { A: "Louis Pasteur", B: "Alexander Fleming", C: "Robert Koch", D: "Edward Jenner" },
    correctAnswer: "B",
    explanation: "Alexander Fleming discovered penicillin (1928) from Penicillium notatum fungus.",
    chapterId: 32, chapterName: "Microbes in Human Welfare", source: "NCERT"
  },
  {
    id: 147,
    question: "Biogas mainly contains:",
    options: { A: "Carbon dioxide", B: "Methane", C: "Hydrogen", D: "Nitrogen" },
    correctAnswer: "B",
    explanation: "Biogas is mainly methane (50-70%) produced by methanogenic bacteria during anaerobic digestion.",
    chapterId: 32, chapterName: "Microbes in Human Welfare", source: "PYQ", year: 2020
  },
  {
    id: 148,
    question: "BOD stands for:",
    options: { A: "Biological Oxygen Demand", B: "Biochemical Oxygen Demand", C: "Both A and B", D: "None" },
    correctAnswer: "C",
    explanation: "BOD (Biological/Biochemical Oxygen Demand) measures organic pollution in water.",
    chapterId: 32, chapterName: "Microbes in Human Welfare", source: "NCERT"
  },

  // Chapter 33: Biotechnology Principles and Processes (5 questions)
  {
    id: 149,
    question: "Restriction enzymes are also called:",
    options: { A: "Molecular scissors", B: "Molecular glue", C: "Molecular markers", D: "Molecular probes" },
    correctAnswer: "A",
    explanation: "Restriction enzymes (endonucleases) are 'molecular scissors' that cut DNA at specific sequences.",
    chapterId: 33, chapterName: "Biotechnology Principles and Processes", source: "PYQ", year: 2021
  },
  {
    id: 150,
    question: "Plasmid is:",
    options: { A: "Chromosomal DNA", B: "Extra-chromosomal DNA", C: "RNA", D: "Protein" },
    correctAnswer: "B",
    explanation: "Plasmids are small, circular, extra-chromosomal DNA molecules used as vectors in cloning.",
    chapterId: 33, chapterName: "Biotechnology Principles and Processes", source: "NCERT"
  },
  {
    id: 151,
    question: "PCR stands for:",
    options: { A: "Protein Chain Reaction", B: "Polymerase Chain Reaction", C: "Polymer Chain Reaction", D: "None" },
    correctAnswer: "B",
    explanation: "PCR (Polymerase Chain Reaction) amplifies specific DNA sequences using Taq polymerase.",
    chapterId: 33, chapterName: "Biotechnology Principles and Processes", source: "PYQ", year: 2020
  },
  {
    id: 152,
    question: "DNA ligase is used to:",
    options: { A: "Cut DNA", B: "Join DNA fragments", C: "Amplify DNA", D: "Separate DNA" },
    correctAnswer: "B",
    explanation: "DNA ligase joins (ligates) DNA fragments by forming phosphodiester bonds - 'molecular glue'.",
    chapterId: 33, chapterName: "Biotechnology Principles and Processes", source: "NCERT"
  },
  {
    id: 153,
    question: "Which is used as a selectable marker?",
    options: { A: "ori", B: "Antibiotic resistance gene", C: "Promoter", D: "Terminator" },
    correctAnswer: "B",
    explanation: "Antibiotic resistance genes serve as selectable markers to identify transformed cells.",
    chapterId: 33, chapterName: "Biotechnology Principles and Processes", source: "PYQ", year: 2019
  },

  // Chapter 34: Biotechnology and its Applications (5 questions)
  {
    id: 154,
    question: "Bt cotton is resistant to:",
    options: { A: "Viral disease", B: "Fungal disease", C: "Insect pest", D: "Bacterial disease" },
    correctAnswer: "C",
    explanation: "Bt cotton contains Bacillus thuringiensis cry gene, producing toxin against bollworm insects.",
    chapterId: 34, chapterName: "Biotechnology and its Applications", source: "PYQ", year: 2021
  },
  {
    id: 155,
    question: "Golden rice is rich in:",
    options: { A: "Vitamin A precursor", B: "Vitamin C", C: "Protein", D: "Iron" },
    correctAnswer: "A",
    explanation: "Golden rice is genetically modified to produce beta-carotene (pro-vitamin A) in grains.",
    chapterId: 34, chapterName: "Biotechnology and its Applications", source: "NCERT"
  },
  {
    id: 156,
    question: "Transgenic animals are used for:",
    options: { A: "Production of pharmaceuticals", B: "Testing drug toxicity", C: "Study of diseases", D: "All of these" },
    correctAnswer: "D",
    explanation: "Transgenic animals serve multiple purposes: pharming, toxicity testing, and disease research.",
    chapterId: 34, chapterName: "Biotechnology and its Applications", source: "PYQ", year: 2020
  },
  {
    id: 157,
    question: "First genetically modified insulin was produced in:",
    options: { A: "E. coli", B: "Yeast", C: "Tobacco", D: "Mice" },
    correctAnswer: "A",
    explanation: "Human insulin (Humulin) was first produced using genetically modified E. coli bacteria.",
    chapterId: 34, chapterName: "Biotechnology and its Applications", source: "NCERT"
  },
  {
    id: 158,
    question: "Gene therapy involves:",
    options: { A: "Replacing defective genes", B: "Removing genes", C: "Cloning genes", D: "Sequencing genes" },
    correctAnswer: "A",
    explanation: "Gene therapy corrects genetic disorders by replacing or supplementing defective genes.",
    chapterId: 34, chapterName: "Biotechnology and its Applications", source: "PYQ", year: 2019
  },

  // Chapter 35: Organisms and Populations (5 questions)
  {
    id: 159,
    question: "The study of interactions between organisms and environment is:",
    options: { A: "Genetics", B: "Ecology", C: "Evolution", D: "Taxonomy" },
    correctAnswer: "B",
    explanation: "Ecology is the study of interactions between organisms and their biotic and abiotic environment.",
    chapterId: 35, chapterName: "Organisms and Populations", source: "NCERT"
  },
  {
    id: 160,
    question: "Conformers are organisms that:",
    options: { A: "Maintain constant internal environment", B: "Change with environment", C: "Migrate", D: "Hibernate" },
    correctAnswer: "B",
    explanation: "Conformers allow their body conditions to change with external environment (e.g., fish body temperature).",
    chapterId: 35, chapterName: "Organisms and Populations", source: "PYQ", year: 2021
  },
  {
    id: 161,
    question: "Logistic growth curve is:",
    options: { A: "J-shaped", B: "S-shaped", C: "Linear", D: "Exponential" },
    correctAnswer: "B",
    explanation: "Logistic growth shows S-shaped (sigmoid) curve due to carrying capacity limiting population growth.",
    chapterId: 35, chapterName: "Organisms and Populations", source: "NCERT"
  },
  {
    id: 162,
    question: "Carrying capacity is represented by:",
    options: { A: "r", B: "K", C: "N", D: "e" },
    correctAnswer: "B",
    explanation: "K represents carrying capacity - maximum population size an environment can sustain.",
    chapterId: 35, chapterName: "Organisms and Populations", source: "PYQ", year: 2020
  },
  {
    id: 163,
    question: "Commensalism benefits:",
    options: { A: "Both species", B: "One species, other unaffected", C: "One species, other harmed", D: "Neither species" },
    correctAnswer: "B",
    explanation: "Commensalism: one species benefits while the other is neither harmed nor benefited (e.g., orchid on tree).",
    chapterId: 35, chapterName: "Organisms and Populations", source: "NCERT"
  },

  // Chapter 36: Ecosystem (5 questions)
  {
    id: 164,
    question: "Producers in an ecosystem are:",
    options: { A: "Herbivores", B: "Carnivores", C: "Autotrophs", D: "Decomposers" },
    correctAnswer: "C",
    explanation: "Producers are autotrophs (mainly plants) that synthesize organic compounds from inorganic sources.",
    chapterId: 36, chapterName: "Ecosystem", source: "PYQ", year: 2021
  },
  {
    id: 165,
    question: "10% law of energy transfer was given by:",
    options: { A: "Odum", B: "Lindeman", C: "Tansley", D: "Elton" },
    correctAnswer: "B",
    explanation: "Lindeman (1942) proposed 10% law: only 10% energy transfers to next trophic level.",
    chapterId: 36, chapterName: "Ecosystem", source: "NCERT"
  },
  {
    id: 166,
    question: "Pyramid of energy is always:",
    options: { A: "Upright", B: "Inverted", C: "Spindle-shaped", D: "Variable" },
    correctAnswer: "A",
    explanation: "Pyramid of energy is always upright because energy decreases at each trophic level (10% law).",
    chapterId: 36, chapterName: "Ecosystem", source: "PYQ", year: 2020
  },
  {
    id: 167,
    question: "Primary succession on bare rock starts with:",
    options: { A: "Herbs", B: "Lichens", C: "Mosses", D: "Trees" },
    correctAnswer: "B",
    explanation: "Primary succession on rocks begins with pioneer species like lichens that help soil formation.",
    chapterId: 36, chapterName: "Ecosystem", source: "NCERT"
  },
  {
    id: 168,
    question: "Decomposers help in:",
    options: { A: "Nutrient cycling", B: "Energy flow", C: "Food production", D: "Photosynthesis" },
    correctAnswer: "A",
    explanation: "Decomposers (fungi, bacteria) break down dead matter, releasing nutrients back to ecosystem.",
    chapterId: 36, chapterName: "Ecosystem", source: "PYQ", year: 2019
  },

  // Chapter 37: Biodiversity and Conservation (5 questions)
  {
    id: 169,
    question: "Which is a biodiversity hotspot in India?",
    options: { A: "Thar desert", B: "Western Ghats", C: "Gangetic plains", D: "Deccan plateau" },
    correctAnswer: "B",
    explanation: "Western Ghats is one of 36 global biodiversity hotspots with high endemism and threat level.",
    chapterId: 37, chapterName: "Biodiversity and Conservation", source: "PYQ", year: 2021
  },
  {
    id: 170,
    question: "Alpha diversity refers to:",
    options: { A: "Diversity within a community", B: "Diversity between communities", C: "Global diversity", D: "Genetic diversity" },
    correctAnswer: "A",
    explanation: "Alpha diversity is species diversity within a single community or habitat.",
    chapterId: 37, chapterName: "Biodiversity and Conservation", source: "NCERT"
  },
  {
    id: 171,
    question: "Ex-situ conservation includes:",
    options: { A: "National parks", B: "Zoos and botanical gardens", C: "Wildlife sanctuaries", D: "Biosphere reserves" },
    correctAnswer: "B",
    explanation: "Ex-situ (off-site) conservation involves protecting species outside natural habitat - zoos, seed banks, etc.",
    chapterId: 37, chapterName: "Biodiversity and Conservation", source: "PYQ", year: 2020
  },
  {
    id: 172,
    question: "Red Data Book contains list of:",
    options: { A: "All species", B: "Endangered species", C: "Extinct species only", D: "Endemic species" },
    correctAnswer: "B",
    explanation: "Red Data Book (IUCN) lists endangered species categorized by threat level (CR, EN, VU, etc.).",
    chapterId: 37, chapterName: "Biodiversity and Conservation", source: "NCERT"
  },
  {
    id: 173,
    question: "Endemic species are found:",
    options: { A: "Worldwide", B: "In specific geographical areas only", C: "In zoos", D: "In all continents" },
    correctAnswer: "B",
    explanation: "Endemic species are native to and found only in specific geographical regions (e.g., Nilgiri Tahr).",
    chapterId: 37, chapterName: "Biodiversity and Conservation", source: "PYQ", year: 2019
  },

  // Chapter 38: Environmental Issues (7 questions to reach 180)
  {
    id: 174,
    question: "Ozone layer is present in:",
    options: { A: "Troposphere", B: "Stratosphere", C: "Mesosphere", D: "Thermosphere" },
    correctAnswer: "B",
    explanation: "Ozone layer (O3) is in stratosphere (15-35 km), protecting Earth from harmful UV radiation.",
    chapterId: 38, chapterName: "Environmental Issues", source: "PYQ", year: 2021
  },
  {
    id: 175,
    question: "Which gas is responsible for global warming?",
    options: { A: "Oxygen", B: "Nitrogen", C: "Carbon dioxide", D: "Hydrogen" },
    correctAnswer: "C",
    explanation: "CO2 is the major greenhouse gas causing global warming by trapping infrared radiation.",
    chapterId: 38, chapterName: "Environmental Issues", source: "NCERT"
  },
  {
    id: 176,
    question: "Eutrophication is caused by:",
    options: { A: "Heavy metals", B: "Excess nutrients", C: "Pesticides", D: "Radioactive waste" },
    correctAnswer: "B",
    explanation: "Eutrophication results from excess nutrients (N, P) causing algal bloom and oxygen depletion.",
    chapterId: 38, chapterName: "Environmental Issues", source: "PYQ", year: 2020
  },
  {
    id: 177,
    question: "CFC damages:",
    options: { A: "Troposphere", B: "Ozone layer", C: "Hydrosphere", D: "Lithosphere" },
    correctAnswer: "B",
    explanation: "CFCs (chlorofluorocarbons) release chlorine atoms that catalytically destroy ozone molecules.",
    chapterId: 38, chapterName: "Environmental Issues", source: "NCERT"
  },
  {
    id: 178,
    question: "Biomagnification refers to:",
    options: { A: "Increase in organism size", B: "Increase in toxin concentration in food chain", C: "Increase in population", D: "Increase in biodiversity" },
    correctAnswer: "B",
    explanation: "Biomagnification is increase in concentration of persistent toxins (like DDT) at higher trophic levels.",
    chapterId: 38, chapterName: "Environmental Issues", source: "PYQ", year: 2019
  },
  {
    id: 179,
    question: "Acid rain is caused by:",
    options: { A: "CO2 and CO", B: "SO2 and NOx", C: "CH4 and N2O", D: "O3 and CFCs" },
    correctAnswer: "B",
    explanation: "Acid rain forms when SO2 and NOx react with water vapor to form sulfuric and nitric acids.",
    chapterId: 38, chapterName: "Environmental Issues", source: "NCERT"
  },
  {
    id: 180,
    question: "E-waste contains:",
    options: { A: "Only plastics", B: "Heavy metals and toxins", C: "Biodegradable materials", D: "Only glass" },
    correctAnswer: "B",
    explanation: "E-waste (electronic waste) contains hazardous heavy metals like lead, mercury, cadmium, and toxins.",
    chapterId: 38, chapterName: "Environmental Issues", source: "PYQ", year: 2021
  }
];

// Generate more questions for each chapter programmatically
export function generateQuestionsForChapter(chapterId: number, chapterName: string, count: number = 100): Question[] {
  const baseQuestions = sampleQuestions.filter(q => q.chapterId === chapterId);
  const questions: Question[] = [...baseQuestions];
  
  // If we have base questions, return them
  if (baseQuestions.length > 0) {
    return baseQuestions;
  }
  
  // For chapters without base questions, return empty array (would be populated from database)
  return questions;
}

export function getAllChapters() {
  return [
    { classNumber: 11, chapters: class11Chapters },
    { classNumber: 12, chapters: class12Chapters }
  ];
}

export function getChapterById(id: number) {
  const allChapters = [...class11Chapters, ...class12Chapters];
  return allChapters.find(c => c.id === id);
}

export function getQuestionsByChapter(chapterId: number): Question[] {
  // Include admin questions along with sample questions
  let adminQuestions: Question[] = [];
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("neet_admin_questions");
      if (stored) {
        adminQuestions = JSON.parse(stored);
      }
    }
  } catch {}

  const allQuestions = [...adminQuestions, ...sampleQuestions];
  return allQuestions.filter(q => q.chapterId === chapterId);
}

export function getDemoQuestions(): Question[] {
  return sampleQuestions.slice(0, 10);
}
export function getQuestionSetsByChapter(chapterId: number): {
  setNumber: number;
  label: string;
  questions: Question[];
  type: "auto" | "manual";
}[] {
  // Load admin questions
  let adminQuestions: Question[] = [];
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("neet_admin_questions");
      if (stored) adminQuestions = JSON.parse(stored);
    }
  } catch {}

  // Merge admin + sample questions for this chapter
  const allQuestions = [...adminQuestions, ...sampleQuestions].filter(
    (q) => q.chapterId === chapterId
  );

  // Check for manually assigned sets
  const manualSets: Record<number, Question[]> = {};
  const autoQuestions: Question[] = [];

  allQuestions.forEach((q: any) => {
    if (q.setNumber) {
      if (!manualSets[q.setNumber]) manualSets[q.setNumber] = [];
      manualSets[q.setNumber].push(q);
    } else {
      autoQuestions.push(q);
    }
  });

  const sets: { setNumber: number; label: string; questions: Question[]; type: "auto" | "manual" }[] = [];

  // Add manual sets first
  Object.entries(manualSets).forEach(([num, qs]) => {
    sets.push({
      setNumber: parseInt(num),
      label: `Set ${num}`,
      questions: qs,
      type: "manual",
    });
  });

  // Auto sets from remaining questions (90 per set)
  const SET_SIZE = 90;
  for (let i = 0; i < autoQuestions.length; i += SET_SIZE) {
    const setNum = sets.length + 1;
    sets.push({
      setNumber: setNum,
      label: `Set ${setNum}`,
      questions: autoQuestions.slice(i, i + SET_SIZE),
      type: "auto",
    });
  }

  // PYQ Set
  const pyqQuestions = allQuestions.filter((q) => q.source === "PYQ");
  if (pyqQuestions.length > 0) {
    sets.push({
      setNumber: sets.length + 1,
      label: "PYQ Set",
      questions: pyqQuestions,
      type: "auto",
    });
  }

  return sets;
}