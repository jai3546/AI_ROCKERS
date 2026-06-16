export interface MindMapNode {
  id: string
  label: string
  color?: string
  children?: MindMapNode[]
}

// Preset mind maps for specific topics
const mindMapTemplates: Record<string, MindMapNode> = {
  "Photosynthesis": {
    id: "root-photo",
    label: "Photosynthesis",
    color: "#16a34a",
    children: [
      {
        id: "p1",
        label: "Reactants",
        color: "#ea580c",
        children: [
          { id: "p1_1", label: "Carbon Dioxide (6CO2)", color: "#f97316" },
          { id: "p1_2", label: "Water (6H2O)", color: "#38bdf8" },
          { id: "p1_3", label: "Light Energy", color: "#eab308" }
        ]
      },
      {
        id: "p2",
        label: "Products",
        color: "#2563eb",
        children: [
          { id: "p2_1", label: "Glucose (C6H12O6)", color: "#3b82f6" },
          { id: "p2_2", label: "Oxygen (6O2)", color: "#10b981" }
        ]
      },
      {
        id: "p3",
        label: "Stages",
        color: "#9333ea",
        children: [
          { id: "p3_1", label: "Light-dependent Reactions", color: "#a855f7" },
          { id: "p3_2", label: "Light-independent (Calvin)", color: "#c084fc" }
        ]
      },
      {
        id: "p4",
        label: "Location",
        color: "#db2777",
        children: [
          { id: "p4_1", label: "Chloroplasts", color: "#f472b6" },
          { id: "p4_2", label: "Chlorophyll pigment", color: "#fb7185" }
        ]
      }
    ]
  },
  "Photosynthesis Process": {
    id: "root-photo-proc",
    label: "Photosynthesis",
    color: "#16a34a",
    children: [
      {
        id: "pp1",
        label: "Reactants",
        color: "#ea580c",
        children: [
          { id: "pp1_1", label: "Carbon Dioxide", color: "#f97316" },
          { id: "pp1_2", label: "Water", color: "#38bdf8" },
          { id: "pp1_3", label: "Sunlight", color: "#eab308" }
        ]
      },
      {
        id: "pp2",
        label: "Products",
        color: "#2563eb",
        children: [
          { id: "pp2_1", label: "Glucose (Sugar)", color: "#3b82f6" },
          { id: "pp2_2", label: "Oxygen Gas", color: "#10b981" }
        ]
      },
      {
        id: "pp3",
        label: "Structure",
        color: "#9333ea",
        children: [
          { id: "pp3_1", label: "Chloroplasts", color: "#a855f7" },
          { id: "pp3_2", label: "Thylakoid Membrane", color: "#c084fc" },
          { id: "pp3_3", label: "Stroma", color: "#d8b4fe" }
        ]
      }
    ]
  },
  "States of Matter": {
    id: "root-matter",
    label: "States of Matter",
    color: "#2563eb",
    children: [
      {
        id: "m1",
        label: "Solid",
        color: "#dc2626",
        children: [
          { id: "m1_1", label: "Fixed Shape & Volume", color: "#ef4444" },
          { id: "m1_2", label: "Particles Vibrate", color: "#f87171" },
          { id: "m1_3", label: "Strong Forces", color: "#fca5a5" }
        ]
      },
      {
        id: "m2",
        label: "Liquid",
        color: "#d97706",
        children: [
          { id: "m2_1", label: "Fixed Volume Only", color: "#f59e0b" },
          { id: "m2_2", label: "Takes Container Shape", color: "#fbbf24" },
          { id: "m2_3", label: "Moderate Forces", color: "#fcd34d" }
        ]
      },
      {
        id: "m3",
        label: "Gas",
        color: "#059669",
        children: [
          { id: "m3_1", label: "No Fixed Shape/Volume", color: "#10b981" },
          { id: "m3_2", label: "Rapid Random Movement", color: "#34d399" },
          { id: "m3_3", label: "Negligible Forces", color: "#6ee7b7" }
        ]
      },
      {
        id: "m4",
        label: "Plasma",
        color: "#7c3aed",
        children: [
          { id: "m4_1", label: "Superheated Gas", color: "#8b5cf6" },
          { id: "m4_2", label: "Ionized Particles", color: "#a78bfa" },
          { id: "m4_3", label: "Found in Stars & Neon", color: "#c4b5fd" }
        ]
      }
    ]
  },
  "Circle Geometry Fundamentals": {
    id: "root-circle",
    label: "Circle Geometry",
    color: "#7c3aed",
    children: [
      {
        id: "c1",
        label: "Lines & Segments",
        color: "#0891b2",
        children: [
          { id: "c1_1", label: "Radius (r)", color: "#06b6d4" },
          { id: "c1_2", label: "Diameter (d = 2r)", color: "#22d3ee" },
          { id: "c1_3", label: "Chord & Secant", color: "#67e8f9" }
        ]
      },
      {
        id: "c2",
        label: "Formulas",
        color: "#ea580c",
        children: [
          { id: "c2_1", label: "Circumference (2πr)", color: "#f97316" },
          { id: "c2_2", label: "Area (πr²)", color: "#fb923c" }
        ]
      },
      {
        id: "c3",
        label: "Regions",
        color: "#16a34a",
        children: [
          { id: "c3_1", label: "Sector (Pie shape)", color: "#10b981" },
          { id: "c3_2", label: "Segment", color: "#34d399" },
          { id: "c3_3", label: "Arc (Boundary part)", color: "#6ee7b7" }
        ]
      }
    ]
  },
  "Pythagorean Theorem": {
    id: "root-pythag",
    label: "Pythagorean Theorem",
    color: "#ea580c",
    children: [
      {
        id: "py1",
        label: "Formula",
        color: "#b91c1c",
        children: [
          { id: "py1_1", label: "a² + b² = c²", color: "#dc2626" },
          { id: "py1_2", label: "Applicable to Right Triangles", color: "#ef4444" }
        ]
      },
      {
        id: "py2",
        label: "Triangle Sides",
        color: "#0d9488",
        children: [
          { id: "py2_1", label: "Hypotenuse (c - Longest)", color: "#14b8a6" },
          { id: "py2_2", label: "Opposite Leg (a)", color: "#5eead4" },
          { id: "py2_3", label: "Adjacent Leg (b)", color: "#99f6e4" }
        ]
      },
      {
        id: "py3",
        label: "Applications",
        color: "#2563eb",
        children: [
          { id: "py3_1", label: "Distance Calculation", color: "#3b82f6" },
          { id: "py3_2", label: "Triangulation & GPS", color: "#60a5fa" },
          { id: "py3_3", label: "Construction & Layout", color: "#93c5fd" }
        ]
      }
    ]
  },
  "Parts of Speech": {
    id: "root-speech",
    label: "Parts of Speech",
    color: "#db2777",
    children: [
      {
        id: "s1",
        label: "Naming Words",
        color: "#4f46e5",
        children: [
          { id: "s1_1", label: "Nouns (People, Places, Things)", color: "#6366f1" },
          { id: "s1_2", label: "Pronouns (He, She, It, They)", color: "#818cf8" }
        ]
      },
      {
        id: "s2",
        label: "Action & Modifiers",
        color: "#0891b2",
        children: [
          { id: "s2_1", label: "Verbs (Action/State)", color: "#06b6d4" },
          { id: "s2_2", label: "Adjectives (Describe Nouns)", color: "#22d3ee" },
          { id: "s2_3", label: "Adverbs (Describe Verbs)", color: "#67e8f9" }
        ]
      },
      {
        id: "s3",
        label: "Connectors & Emotion",
        color: "#eab308",
        children: [
          { id: "s3_1", label: "Prepositions (In, On, At)", color: "#facc15" },
          { id: "s3_2", label: "Conjunctions (And, But, Or)", color: "#fde047" },
          { id: "s3_3", label: "Interjections (Wow! Oh!)", color: "#fef08a" }
        ]
      }
    ]
  },
  "Major Rivers of Andhra Pradesh": {
    id: "root-ap-rivers",
    label: "AP Rivers",
    color: "#0284c7",
    children: [
      {
        id: "r1",
        label: "Godavari",
        color: "#16a34a",
        children: [
          { id: "r1_1", label: "Dakshin Ganga", color: "#22c55e" },
          { id: "r1_2", label: "Largest in AP", color: "#4ade80" },
          { id: "r1_3", label: "Fertile Delta Region", color: "#86efac" }
        ]
      },
      {
        id: "r2",
        label: "Krishna",
        color: "#ea580c",
        children: [
          { id: "r2_1", label: "Second-largest", color: "#f97316" },
          { id: "r2_2", label: "Massive Irrigation Delta", color: "#fb923c" }
        ]
      },
      {
        id: "r3",
        label: "Other Key Rivers",
        color: "#7c3aed",
        children: [
          { id: "r3_1", label: "Pennar (Rayalaseema)", color: "#8b5cf6" },
          { id: "r3_2", label: "Vamsadhara", color: "#a78bfa" },
          { id: "r3_3", label: "Nagavali", color: "#c4b5fd" }
        ]
      }
    ]
  },
  "Flora and Fauna of Andhra Pradesh": {
    id: "root-ap-flora",
    label: "AP Biodiversity",
    color: "#059669",
    children: [
      {
        id: "f1",
        label: "State Symbols",
        color: "#ea580c",
        children: [
          { id: "f1_1", label: "Animal: Blackbuck (Krishna Jinka)", color: "#f97316" },
          { id: "f1_2", label: "Bird: Rose-ringed parakeet", color: "#22c55e" },
          { id: "f1_3", label: "Flower: Jasmine (Chamanti)", color: "#eab308" }
        ]
      },
      {
        id: "f2",
        label: "Key Habitats",
        color: "#0284c7",
        children: [
          { id: "f2_1", label: "Eastern Ghats", color: "#38bdf8" },
          { id: "f2_2", label: "Deciduous Forests", color: "#7dd3fc" },
          { id: "f2_3", label: "Coastal Mangroves", color: "#bae6fd" }
        ]
      }
    ]
  },
  "Agricultural Patterns in Andhra Pradesh": {
    id: "root-ap-agri",
    label: "AP Agriculture",
    color: "#16a34a",
    children: [
      {
        id: "ag1",
        label: "Key Crops",
        color: "#0891b2",
        children: [
          { id: "ag1_1", label: "Rice (Rice Bowl of India)", color: "#06b6d4" },
          { id: "ag1_2", label: "Sugarcane", color: "#22d3ee" },
          { id: "ag1_3", label: "Tobacco & Cotton", color: "#67e8f9" }
        ]
      },
      {
        id: "ag2",
        label: "Specialty Crops",
        color: "#ea580c",
        children: [
          { id: "ag2_1", label: "Guntur Red Chillies", color: "#ef4444" },
          { id: "ag2_2", label: "Mangoes & Bananas", color: "#facc15" }
        ]
      },
      {
        id: "ag3",
        label: "Water Sources",
        color: "#2563eb",
        children: [
          { id: "ag3_1", label: "River Canals", color: "#60a5fa" },
          { id: "ag3_2", label: "Monsoon Rainfall", color: "#93c5fd" }
        ]
      }
    ]
  },
  "Telangana State Symbols": {
    id: "root-ts-symbols",
    label: "TS Symbols",
    color: "#e11d48",
    children: [
      {
        id: "ts1",
        label: "Animal & Bird",
        color: "#4f46e5",
        children: [
          { id: "ts1_1", label: "Animal: Spotted Deer (Jinka)", color: "#6366f1" },
          { id: "ts1_2", label: "Bird: Indian Roller (Palapitta)", color: "#818cf8" }
        ]
      },
      {
        id: "ts2",
        label: "Flora",
        color: "#059669",
        children: [
          { id: "ts2_1", label: "Flower: Tangidi Puvvu (Yellow)", color: "#10b981" },
          { id: "ts2_2", label: "Tree: Jammi Chettu", color: "#34d399" }
        ]
      }
    ]
  },
  "Cultural Festivals of Telangana": {
    id: "root-ts-fest",
    label: "TS Festivals",
    color: "#ea580c",
    children: [
      {
        id: "tf1",
        label: "Bathukamma",
        color: "#db2777",
        children: [
          { id: "tf1_1", label: "Floral Festival", color: "#ec4899" },
          { id: "tf1_2", label: "Celebrated by Women", color: "#f472b6" },
          { id: "tf1_3", label: "Traditional Songs & Dances", color: "#fbcfe8" }
        ]
      },
      {
        id: "tf2",
        label: "Bonalu",
        color: "#7c3aed",
        children: [
          { id: "tf2_1", label: "Goddess Mahakali Worship", color: "#8b5cf6" },
          { id: "tf2_2", label: "Processions & Offerings", color: "#a78bfa" }
        ]
      },
      {
        id: "tf3",
        label: "Others",
        color: "#059669",
        children: [
          { id: "tf3_1", label: "Dussehra (Jammi Pooja)", color: "#10b981" },
          { id: "tf3_2", label: "Sankranti (Kites & Rangoli)", color: "#34d399" }
        ]
      }
    ]
  },
  "Historical Monuments of Telangana": {
    id: "root-ts-monu",
    label: "TS Monuments",
    color: "#b45309",
    children: [
      {
        id: "tm1",
        label: "Hyderabad Area",
        color: "#0284c7",
        children: [
          { id: "tm1_1", label: "Charminar (Four Minarets)", color: "#06b6d4" },
          { id: "tm1_2", label: "Golconda Fort (Acoustic structure)", color: "#38bdf8" }
        ]
      },
      {
        id: "tm2",
        label: "Warangal Area",
        color: "#059669",
        children: [
          { id: "tm2_1", label: "Warangal Fort (Kakatiya carving)", color: "#10b981" },
          { id: "tm2_2", label: "Thousand Pillar Temple", color: "#34d399" },
          { id: "tm2_3", label: "Ramappa Temple (UNESCO Site)", color: "#6ee7b7" }
        ]
      }
    ]
  }
}

// Generates a dynamic fallback mind map based on any string
export function getMindMapData(topic: string, subject?: string): MindMapNode {
  // Check if we have a preset template
  const matchedTemplate = Object.keys(mindMapTemplates).find(
    (key) => key.toLowerCase() === topic.toLowerCase() || topic.toLowerCase().includes(key.toLowerCase())
  )

  if (matchedTemplate) {
    return mindMapTemplates[matchedTemplate]
  }

  // Get a theme color based on subject
  let mainColor = "#3b82f6" // blue default
  let childColor1 = "#ef4444"
  let childColor2 = "#10b981"
  let childColor3 = "#eab308"

  if (subject) {
    const s = subject.toLowerCase()
    if (s.includes("sci")) {
      mainColor = "#16a34a" // green
      childColor1 = "#38bdf8" // cyan
      childColor2 = "#eab308" // yellow
      childColor3 = "#fb7185" // pink
    } else if (s.includes("math")) {
      mainColor = "#ea580c" // orange
      childColor1 = "#ef4444" // red
      childColor2 = "#8b5cf6" // purple
      childColor3 = "#06b6d4" // teal
    } else if (s.includes("soc") || s.includes("hist") || s.includes("geog")) {
      mainColor = "#b45309" // brown
      childColor1 = "#2563eb" // blue
      childColor2 = "#059669" // green
      childColor3 = "#db2777" // pink
    } else if (s.includes("eng") || s.includes("lit")) {
      mainColor = "#db2777" // pink
      childColor1 = "#6366f1" // indigo
      childColor2 = "#06b6d4" // teal
      childColor3 = "#f97316" // orange
    } else if (s.includes("comp") || s.includes("code")) {
      mainColor = "#2563eb" // blue
      childColor1 = "#10b981" // green
      childColor2 = "#a855f7" // purple
      childColor3 = "#06b6d4" // teal
    }
  }

  // Generate generic structured fallback children
  return {
    id: `root-${topic.replace(/\s+/g, '-').toLowerCase()}`,
    label: topic,
    color: mainColor,
    children: [
      {
        id: "c1",
        label: "Core Concepts",
        color: childColor1,
        children: [
          { id: "c1_1", label: "Fundamental principles", color: childColor1 },
          { id: "c1_2", label: "Key Definitions", color: childColor1 },
          { id: "c1_3", label: "Historical background", color: childColor1 }
        ]
      },
      {
        id: "c2",
        label: "Key Features",
        color: childColor2,
        children: [
          { id: "c2_1", label: "Important Elements", color: childColor2 },
          { id: "c2_2", label: "Core Functions", color: childColor2 }
        ]
      },
      {
        id: "c3",
        label: "Applications",
        color: childColor3,
        children: [
          { id: "c3_1", label: "Real-world examples", color: childColor3 },
          { id: "c3_2", label: "Practical use-cases", color: childColor3 }
        ]
      }
    ]
  }
}
