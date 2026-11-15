// Initial seed data for CarePulse
export const initialData = {
  patient: {
    id: "pat_001",
    name: "Arthur Pendelton",
    age: 76,
    gender: "Male",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Sulfa drugs"],
    emergencyContacts: [
      { name: "Sarah Pendelton (Daughter / Caretaker)", phone: "+1 (555) 234-5678", relation: "Daughter" },
      { name: "Dr. Emily Watson (Cardiologist)", phone: "+1 (555) 987-6543", relation: "Physician" }
    ],
    primaryDoctor: "Dr. Emily Watson",
    medicalConditions: ["Hypertension", "Type 2 Diabetes", "Mild Arthritis"],
    notes: "Requires assistance with evening insulin dosage. Prefers large print and voice confirmation."
  },
  roles: [
    { id: "senior", name: "Senior (Arthur)", pin: "1234", description: "Simplified voice & 1-tap view" },
    { id: "caretaker", name: "Caretaker (Sarah)", pin: "8888", description: "Full schedule, inventory & vitals control" },
    { id: "family", name: "Family (David)", pin: "5555", description: "Adherence monitor & Love Nudges" },
    { id: "doctor", name: "Doctor (Dr. Watson)", pin: "9999", description: "Clinical review & appointment sync" }
  ],
  medications: [
    {
      id: "med_1",
      name: "Metformin",
      dosage: "500 mg",
      purpose: "Blood Sugar Regulation",
      instructions: "Take with breakfast",
      mealTiming: "with_meal",
      frequency: "daily",
      compartment: "morning", // morning, afternoon, evening, night
      time: "08:00",
      shape: "oval",
      color: "white",
      totalQuantity: 60,
      remainingCount: 24,
      refillThreshold: 10,
      active: true,
      lastTaken: "2026-11-15T08:05:00"
    },
    {
      id: "med_2",
      name: "Lisinopril",
      dosage: "10 mg",
      purpose: "Blood Pressure Control",
      instructions: "Take with full glass of water",
      mealTiming: "before_meal",
      frequency: "daily",
      compartment: "morning",
      time: "08:00",
      shape: "round",
      color: "yellow",
      totalQuantity: 30,
      remainingCount: 18,
      refillThreshold: 7,
      active: true,
      lastTaken: "2026-11-15T08:06:00"
    },
    {
      id: "med_3",
      name: "Glucosamine Chondroitin",
      dosage: "750 mg",
      purpose: "Joint Mobility / Arthritis",
      instructions: "Take with lunch",
      mealTiming: "with_meal",
      frequency: "daily",
      compartment: "afternoon",
      time: "13:00",
      shape: "capsule",
      color: "blue",
      totalQuantity: 90,
      remainingCount: 45,
      refillThreshold: 15,
      active: true,
      lastTaken: null
    },
    {
      id: "med_4",
      name: "Atorvastatin",
      dosage: "20 mg",
      purpose: "Cholesterol Management",
      instructions: "Take at bedtime",
      mealTiming: "after_meal",
      frequency: "daily",
      compartment: "night",
      time: "21:00",
      shape: "oval",
      color: "white",
      totalQuantity: 30,
      remainingCount: 5, // LOW STOCK - TRIGGER REFILL!
      refillThreshold: 7,
      active: true,
      lastTaken: null
    },
    {
      id: "med_5",
      name: "Baby Aspirin (Low Dose)",
      dosage: "81 mg",
      purpose: "Cardiovascular Health",
      instructions: "Take after dinner",
      mealTiming: "after_meal",
      frequency: "daily",
      compartment: "evening",
      time: "19:00",
      shape: "round",
      color: "orange",
      totalQuantity: 100,
      remainingCount: 68,
      refillThreshold: 15,
      active: true,
      lastTaken: null
    }
  ],
  adherenceLogs: [
    { id: "log_1", medicationId: "med_1", date: "2026-11-14", scheduledTime: "08:00", status: "taken", timestamp: "2026-11-14T08:03:00" },
    { id: "log_2", medicationId: "med_2", date: "2026-11-14", scheduledTime: "08:00", status: "taken", timestamp: "2026-11-14T08:04:00" },
    { id: "log_3", medicationId: "med_3", date: "2026-11-14", scheduledTime: "13:00", status: "taken", timestamp: "2026-11-14T13:12:00" },
    { id: "log_4", medicationId: "med_5", date: "2026-11-14", scheduledTime: "19:00", status: "taken", timestamp: "2026-11-14T19:05:00" },
    { id: "log_5", medicationId: "med_4", date: "2026-11-14", scheduledTime: "21:00", status: "taken", timestamp: "2026-11-14T21:10:00" },
    { id: "log_6", medicationId: "med_1", date: "2026-11-15", scheduledTime: "08:00", status: "taken", timestamp: "2026-11-15T08:05:00" },
    { id: "log_7", medicationId: "med_2", date: "2026-11-15", scheduledTime: "08:00", status: "taken", timestamp: "2026-11-15T08:06:00" }
  ],
  appointments: [
    {
      id: "apt_1",
      doctorName: "Dr. Emily Watson",
      specialty: "Cardiology",
      clinic: "St. Jude Heart Center, Suite 402",
      phone: "+1 (555) 987-6543",
      dateTime: "2026-11-18T10:30:00",
      purpose: "Semi-annual cardiovascular & blood pressure review",
      preparationNotes: "Bring recent BP log and list of current medications. Fasting not required.",
      status: "scheduled"
    },
    {
      id: "apt_2",
      doctorName: "Dr. Marcus Lin",
      specialty: "Endocrinology",
      clinic: "Metro Diabetes Care Center",
      phone: "+1 (555) 345-6789",
      dateTime: "2026-11-25T09:00:00",
      purpose: "HbA1c quarterly diabetic evaluation & foot examination",
      preparationNotes: "10-hour fasting required prior to blood draw.",
      status: "scheduled"
    }
  ],
  loveNudges: [
    {
      id: "nudge_1",
      sender: "David (Grandson)",
      avatar: "👦",
      message: "Good luck with your morning walk, Grandpa! Thinking of you ❤️",
      timestamp: "2026-11-15T07:45:00",
      read: true
    },
    {
      id: "nudge_2",
      sender: "Sarah (Daughter)",
      avatar: "👩",
      message: "Don't forget your afternoon glucosamine, Dad! I'll visit after work with fresh fruit 🍎",
      timestamp: "2026-11-15T09:30:00",
      read: false
    }
  ],
  vitals: [
    { id: "v_1", type: "Blood Pressure", value: "124/82 mmHg", status: "normal", timestamp: "2026-11-14T08:15:00" },
    { id: "v_2", type: "Blood Glucose", value: "112 mg/dL", status: "normal", timestamp: "2026-11-14T08:16:00" },
    { id: "v_3", type: "Heart Rate", value: "72 bpm", status: "normal", timestamp: "2026-11-15T08:10:00" }
  ]
};
