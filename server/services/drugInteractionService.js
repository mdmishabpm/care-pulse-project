// Drug Interaction & Safety Warning Engine
// Provides clinical interaction detection and contraindication checks.

const KNOWN_INTERACTIONS = [
  {
    drugs: ["aspirin", "warfarin"],
    severity: "HIGH",
    title: "Severe Bleeding Risk",
    description: "Combining Aspirin with Warfarin significantly amplifies anticoagulant effects, markedly increasing major internal hemorrhage and gastrointestinal bleeding risks.",
    recommendation: "Avoid concurrent use unless strictly monitored by a cardiologist with regular INR titration."
  },
  {
    drugs: ["aspirin", "ibuprofen"],
    severity: "MODERATE",
    title: "Gastrointestinal Toxicity & Reduced Cardioprotection",
    description: "Ibuprofen may competitively antagonize the irreversible platelet inhibition of low-dose aspirin, reducing aspirin's cardioprotective efficacy and escalating peptic ulcer danger.",
    recommendation: "Space ibuprofen intake at least 8 hours after or 30 minutes before immediate-release aspirin."
  },
  {
    drugs: ["lisinopril", "potassium"],
    severity: "HIGH",
    title: "Hyperkalemia (Dangerously High Potassium)",
    description: "Lisinopril is an ACE inhibitor that diminishes aldosterone secretion, promoting potassium retention. Adding potassium supplements can trigger fatal cardiac arrhythmias.",
    recommendation: "Regularly monitor serum potassium and renal panel. Discontinue non-prescribed potassium supplements."
  },
  {
    drugs: ["metformin", "alcohol"],
    severity: "HIGH",
    title: "Lactic Acidosis Warning",
    description: "Excessive alcohol consumption potentiates the effect of metformin on lactate metabolism, elevating the risk of severe life-threatening lactic acidosis and hypoglycemia.",
    recommendation: "Strictly avoid binge drinking or acute alcohol ingestion while taking metformin."
  },
  {
    drugs: ["atorvastatin", "gemfibrozil"],
    severity: "HIGH",
    title: "Rhabdomyolysis & Myopathy Risk",
    description: "Concurrent statin and fibrate therapy drastically heightens skeletal muscle breakdown (rhabdomyolysis) leading to acute renal failure.",
    recommendation: "Use fenofibrate with caution instead, or lower statin dosage under specialist supervision."
  },
  {
    drugs: ["lisinopril", "ibuprofen"],
    severity: "MODERATE",
    title: "Blunted Antihypertensive Effect & Renal Strain",
    description: "NSAIDs reduce renal prostaglandin synthesis, which can elevate blood pressure and impair the therapeutic efficacy of ACE inhibitors like Lisinopril.",
    recommendation: "Limit NSAID duration or consider acetaminophen (paracetamol) for musculoskeletal pain."
  }
];

const ALLERGY_MAP = {
  "penicillin": ["amoxicillin", "ampicillin", "augmentin", "penicillin v"],
  "sulfa": ["bactrim", "septra", "sulfamethoxazole", "sulfasalazine"],
  "aspirin": ["aspirin", "salicylate", "bismuth subsalicylate"]
};

export class DrugInteractionService {
  /**
   * Check a prospective drug or full medication list for dangerous interactions.
   * @param {Array<string|object>} medications List of current medications
   * @param {string|object} [newMedication] Optional new medication being added
   * @param {Array<string>} [patientAllergies] Optional patient allergies list
   * @returns {Array<object>} Detected safety warnings
   */
  static analyzeSafety(medications = [], newMedication = null, patientAllergies = []) {
    const warnings = [];
    const allMeds = [...medications];
    if (newMedication) {
      allMeds.push(newMedication);
    }

    const normalizedNames = allMeds.map(m => {
      const name = typeof m === 'string' ? m : m.name;
      return name ? name.toLowerCase() : "";
    });

    // 1. Check pairwise known interactions
    for (const rule of KNOWN_INTERACTIONS) {
      const matchDrugA = normalizedNames.some(n => n.includes(rule.drugs[0]));
      const matchDrugB = normalizedNames.some(n => n.includes(rule.drugs[1]));

      if (matchDrugA && matchDrugB) {
        warnings.push({
          type: "DRUG_INTERACTION",
          severity: rule.severity,
          title: rule.title,
          drugsInvolved: [rule.drugs[0], rule.drugs[1]],
          description: rule.description,
          recommendation: rule.recommendation
        });
      }
    }

    // 2. Check for duplicate therapeutic classes / duplicate names
    const seen = new Map();
    for (const med of allMeds) {
      const name = (typeof med === 'string' ? med : med.name || "").toLowerCase().trim();
      if (!name) continue;
      if (seen.has(name)) {
        warnings.push({
          type: "DUPLICATE_THERAPY",
          severity: "MODERATE",
          title: `Duplicate Medication: ${name.toUpperCase()}`,
          drugsInvolved: [name],
          description: `You have duplicate active schedules for ${name}. This increases toxicity and accidental overdose risk.`,
          recommendation: "Verify schedule with your prescribing physician or consolidate into a single dosage."
        });
      } else {
        seen.set(name, true);
      }
    }

    // 3. Check for patient allergy conflicts
    for (const allergy of patientAllergies) {
      const cleanAllergy = allergy.toLowerCase().trim();
      const crossReactingDrugs = ALLERGY_MAP[cleanAllergy] || [cleanAllergy];

      for (const med of allMeds) {
        const medName = (typeof med === 'string' ? med : med.name || "").toLowerCase();
        for (const badDrug of crossReactingDrugs) {
          if (medName.includes(badDrug)) {
            warnings.push({
              type: "ALLERGY_CONTRAINDICATION",
              severity: "HIGH",
              title: `Patient Allergy Alert: ${allergy}`,
              drugsInvolved: [medName],
              description: `Patient has documented allergy to ${allergy}. Medication "${medName}" may trigger severe hypersensitivity or anaphylaxis!`,
              recommendation: "DO NOT ADMINISTER. Contact physician immediately for an alternative non-cross-reactive medication."
            });
          }
        }
      }
    }

    return warnings;
  }
}
