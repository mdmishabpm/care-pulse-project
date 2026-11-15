import test from 'node:test';
import assert from 'node:assert/strict';
import { DrugInteractionService } from '../server/services/drugInteractionService.js';

test('DrugInteractionService: Detects severe Aspirin + Warfarin bleeding risk', () => {
  const currentMeds = [{ name: "Warfarin 5mg" }];
  const candidate = { name: "Aspirin 81mg" };
  const warnings = DrugInteractionService.analyzeSafety(currentMeds, candidate);

  assert.ok(warnings.length > 0);
  const bleedWarning = warnings.find(w => w.type === "DRUG_INTERACTION");
  assert.ok(bleedWarning);
  assert.equal(bleedWarning.severity, "HIGH");
  assert.ok(bleedWarning.title.includes("Bleeding"));
});

test('DrugInteractionService: Flags Lisinopril + Potassium hyperkalemia warning', () => {
  const currentMeds = [{ name: "Lisinopril 10mg" }, { name: "Potassium Chloride 20mEq" }];
  const warnings = DrugInteractionService.analyzeSafety(currentMeds);

  const potassiumWarning = warnings.find(w => w.title.includes("Hyperkalemia"));
  assert.ok(potassiumWarning);
  assert.equal(potassiumWarning.severity, "HIGH");
});

test('DrugInteractionService: Flags duplicate medication schedule', () => {
  const currentMeds = [
    { name: "Metformin 500mg" },
    { name: "Metformin 500mg" }
  ];
  const warnings = DrugInteractionService.analyzeSafety(currentMeds);
  const dupWarning = warnings.find(w => w.type === "DUPLICATE_THERAPY");
  assert.ok(dupWarning);
});

test('DrugInteractionService: Detects documented patient allergy contraindications', () => {
  const allergies = ["Penicillin"];
  const currentMeds = [{ name: "Amoxicillin 500mg" }]; // Amoxicillin is in penicillin class
  const warnings = DrugInteractionService.analyzeSafety(currentMeds, null, allergies);

  const allergyWarning = warnings.find(w => w.type === "ALLERGY_CONTRAINDICATION");
  assert.ok(allergyWarning);
  assert.equal(allergyWarning.severity, "HIGH");
});
