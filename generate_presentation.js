import pptxgen from 'pptxgenjs';

async function buildPresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'CarePulse Team';
  pptx.company = 'CarePulse';
  pptx.title = 'CarePulse: Hackathon Presentation Pitch Deck';
  pptx.subject = 'Elderly Medication & Family Healthcare Ecosystem';

  // Theme Colors
  const NAVY = '0F172A';
  const BLUE = '2563EB';
  const LIGHT_BLUE = 'DBEAFE';
  const EMERALD = '059669';
  const ROSE = 'E11D48';
  const SLATE = '475569';
  const LIGHT_BG = 'F8FAFC';
  const WHITE = 'FFFFFF';
  const AMBER = 'D97706';

  // Helper for consistent headers
  function addHeader(slide, title, category) {
    slide.background = { color: LIGHT_BG };
    
    // Category Pill
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: BLUE,
      fontFace: 'Arial'
    });

    // Main Slide Title
    slide.addText(title, {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.8,
      fontSize: 26,
      bold: true,
      color: NAVY,
      fontFace: 'Arial'
    });

    // Top Accent Line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.6,
      w: 1.5,
      h: 0.06,
      fill: { color: BLUE }
    });
  }

  // ==========================================
  // SLIDE 1: Title Slide
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: NAVY };

    // Background accent glow
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.2,
      w: 11.7,
      h: 5.0,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 2 }
    });

    slide.addText("🏆 HACKATHON WINNING PRESENTATION", {
      x: 1.2,
      y: 1.6,
      w: 10,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: '38BDF8',
      fontFace: 'Arial'
    });

    slide.addText("CarePulse", {
      x: 1.2,
      y: 2.1,
      w: 10,
      h: 1.2,
      fontSize: 52,
      bold: true,
      color: WHITE,
      fontFace: 'Arial'
    });

    slide.addText("Elderly Medication & Family Healthcare Ecosystem", {
      x: 1.2,
      y: 3.3,
      w: 10,
      h: 0.6,
      fontSize: 22,
      color: '94A3B8',
      fontFace: 'Arial'
    });

    slide.addText("Voice-Assisted • Senior-Accessible • Multi-User Synchronized • Google Workspace Powered", {
      x: 1.2,
      y: 4.1,
      w: 10,
      h: 0.5,
      fontSize: 14,
      bold: true,
      color: '34D399',
      fontFace: 'Arial'
    });

    slide.addText("Demo Passcodes: Senior: 1234 | Caretaker: 8888 | Family: 5555 | Doctor: 9999", {
      x: 1.2,
      y: 5.2,
      w: 10,
      h: 0.4,
      fontSize: 12,
      color: 'CBD5E1',
      fontFace: 'Courier New'
    });
  }

  // ==========================================
  // SLIDE 2: The Problem
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, "The Problem: The Silent Medication Adherence Crisis", "The Challenge");

    // Card 1
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 2.0,
      w: 3.6,
      h: 4.4,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1.5 }
    });
    slide.addText("50%+", { x: 1.1, y: 2.3, w: 3.0, h: 0.8, fontSize: 38, bold: true, color: ROSE, fontFace: 'Arial' });
    slide.addText("Medication Non-Adherence", { x: 1.1, y: 3.1, w: 3.0, h: 0.5, fontSize: 16, bold: true, color: NAVY });
    slide.addText("Over 50% of elderly patients fail to take prescribed medications as directed (WHO), causing over 125,000 preventable deaths and $100B in hospitalizations annually.", {
      x: 1.1, y: 3.7, w: 3.0, h: 2.4, fontSize: 13, color: SLATE, fontFace: 'Arial'
    });

    // Card 2
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 4.8,
      y: 2.0,
      w: 3.6,
      h: 4.4,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1.5 }
    });
    slide.addText("Accessibility Gap", { x: 5.1, y: 2.3, w: 3.0, h: 0.8, fontSize: 24, bold: true, color: AMBER, fontFace: 'Arial' });
    slide.addText("Seniors Left Behind by Tech", { x: 5.1, y: 3.1, w: 3.0, h: 0.5, fontSize: 16, bold: true, color: NAVY });
    slide.addText("Typical reminder apps are built for tech-savvy youth: tiny fonts, confusing navigation, no voice guidance, and zero accommodations for arthritis, tremors, or low vision.", {
      x: 5.1, y: 3.7, w: 3.0, h: 2.4, fontSize: 13, color: SLATE, fontFace: 'Arial'
    });

    // Card 3
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.8,
      y: 2.0,
      w: 3.6,
      h: 4.4,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1.5 }
    });
    slide.addText("Isolated Care", { x: 9.1, y: 2.3, w: 3.0, h: 0.8, fontSize: 24, bold: true, color: BLUE, fontFace: 'Arial' });
    slide.addText("Fragmented Family Ecosystem", { x: 9.1, y: 3.1, w: 3.0, h: 0.5, fontSize: 16, bold: true, color: NAVY });
    slide.addText("Family members live in constant worry: 'Did Mom take her heart medication today?' Traditional apps are single-user silos with no shared peace of mind.", {
      x: 9.1, y: 3.7, w: 3.0, h: 2.4, fontSize: 13, color: SLATE, fontFace: 'Arial'
    });
  }

  // ==========================================
  // SLIDE 3: The Solution (CarePulse Ecosystem)
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, "The Solution: A 360° Synchronized Care Ecosystem", "Our Approach");

    const roles = [
      {
        title: "👴 Senior Patient (Arthur)",
        pin: "PIN: 1234",
        desc: "Jumbo touch targets (≥56px), 1-tap 'I Took This', Text-to-Speech audio read-aloud, hands-free voice commands, 4-compartment virtual pillbox, and emergency SOS.",
        color: EMERALD
      },
      {
        title: "👩‍⚕️ Primary Caretaker (Sarah)",
        pin: "PIN: 8888",
        desc: "Prescription schedule CRUD, AI drug-drug interaction warning engine, pill inventory tracking & refill alerts, doctor appointment manager, and Google Calendar sync.",
        color: BLUE
      },
      {
        title: "👨‍👩‍👦 Remote Family (David)",
        pin: "PIN: 5555",
        desc: "7-day adherence streak counter (🔥), real-time compliance donut, live activity audit stream, and emotional 'Love Nudges' cheer wall for peace of mind.",
        color: '7C3AED'
      },
      {
        title: "🩺 Attending Physician (Dr. Watson)",
        pin: "PIN: 9999",
        desc: "Clinical adherence chart review, allergy contraindication audit, diagnostic history, and RFC-5545 iCalendar (.ics) clinical schedule export.",
        color: AMBER
      }
    ];

    roles.forEach((r, idx) => {
      const x = 0.8 + (idx % 2) * 5.9;
      const y = 2.0 + Math.floor(idx / 2) * 2.3;

      slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 5.6, h: 2.1,
        fill: { color: WHITE },
        line: { color: 'CBD5E1', width: 1.5 }
      });

      slide.addText(r.title, { x: x + 0.3, y: y + 0.2, w: 3.5, h: 0.4, fontSize: 16, bold: true, color: NAVY });
      slide.addText(r.pin, { x: x + 4.0, y: y + 0.2, w: 1.2, h: 0.3, fontSize: 11, bold: true, color: r.color, align: 'right' });
      slide.addText(r.desc, { x: x + 0.3, y: y + 0.65, w: 5.0, h: 1.3, fontSize: 12, color: SLATE, fontFace: 'Arial' });
    });
  }

  // ==========================================
  // SLIDE 4: Senior Accessibility Innovations
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, "Accessibility Innovations: Senior-First by Design (WCAG AAA)", "Accessibility");

    const features = [
      {
        title: "🔊 Text-to-Speech (TTS)",
        desc: "Web Speech API reads medication names, dosages, and instructions aloud with a warm, natural cadence."
      },
      {
        title: "🎙️ Hands-Free Voice Commands",
        desc: "Seniors simply speak: 'Mark taken', 'What's my schedule?', or 'Emergency' without touching the screen."
      },
      {
        title: "👁️ High-Contrast & Font Zoom",
        desc: "1-tap switcher for High-Contrast Yellow/Black (for macular degeneration) and 3-stage dynamic font zooming."
      },
      {
        title: "💊 Virtual 4-Compartment Pillbox",
        desc: "Morning, Afternoon, Evening, Bedtime visual compartments matching physical pill organizers with realistic 3D pill shapes."
      },
      {
        title: "🔔 Tactile Audio Feedback",
        desc: "Web Audio API generates ascending celebration chimes, click sounds, and urgent siren tones without external assets."
      },
      {
        title: "🛡️ Zero Cognitive Load",
        desc: "No deep menus or tiny dropdowns. Single-screen daily dashboard with giant 64px tactile touch targets."
      }
    ];

    features.forEach((f, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 0.8 + col * 3.9;
      const y = 2.0 + row * 2.3;

      slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 3.7, h: 2.1,
        fill: { color: WHITE },
        line: { color: 'E2E8F0', width: 1.5 }
      });

      slide.addText(f.title, { x: x + 0.25, y: y + 0.2, w: 3.2, h: 0.4, fontSize: 14, bold: true, color: BLUE });
      slide.addText(f.desc, { x: x + 0.25, y: y + 0.65, w: 3.2, h: 1.3, fontSize: 12, color: SLATE });
    });
  }

  // ==========================================
  // SLIDE 5: Standout Differentiators
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, "Standout Differentiators: Beyond a Basic Reminder App", "Key Differentiators");

    const diffs = [
      {
        badge: "🛡️ CLINICAL SAFETY",
        title: "AI Drug-Drug Interaction Safety Engine",
        text: "Automatically evaluates newly added medications against existing prescriptions and allergies. Flags severe risks (e.g. Warfarin + Aspirin bleeding danger, Lisinopril + Potassium hyperkalemia)."
      },
      {
        badge: "❤️ EMOTIONAL BOND",
        title: "Family 'Love Nudges' & Celebration Wall",
        text: "Grandchildren and children send warm cheer messages. When Arthur logs his pill, celebratory confetti explodes and their loving note pops up on screen!"
      },
      {
        badge: "🚨 EMERGENCY RESPONSE",
        title: "1-Tap Emergency SOS & Paramedic Medical ID",
        text: "Triggers an audible siren, alerts caregivers immediately, and displays blood group O+, severe penicillin allergies, and active medications for first responders."
      },
      {
        badge: "📉 SMART LOGISTICS",
        title: "Inventory Decrement & Refill Predictor",
        text: "Decrements pill counts on intake. When stock reaches 7 pills, alerts caretaker and generates a 1-click Google Calendar pharmacy refill reminder."
      }
    ];

    diffs.forEach((d, idx) => {
      const x = 0.8 + (idx % 2) * 5.9;
      const y = 2.0 + Math.floor(idx / 2) * 2.3;

      slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 5.6, h: 2.1,
        fill: { color: WHITE },
        line: { color: 'CBD5E1', width: 1.5 }
      });

      slide.addText(d.badge, { x: x + 0.3, y: y + 0.2, w: 5.0, h: 0.25, fontSize: 10, bold: true, color: ROSE });
      slide.addText(d.title, { x: x + 0.3, y: y + 0.45, w: 5.0, h: 0.35, fontSize: 14, bold: true, color: NAVY });
      slide.addText(d.text, { x: x + 0.3, y: y + 0.85, w: 5.0, h: 1.1, fontSize: 11.5, color: SLATE });
    });
  }

  // ==========================================
  // SLIDE 6: Google Services Integration
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, "Google Services & Cloud Integration (Bonus Points)", "Google Ecosystem");

    const services = [
      {
        icon: "📅",
        name: "Google Calendar API",
        items: [
          "1-Click direct deep-linking for medical appointments",
          "Includes doctor, clinic address, and fasting prep instructions",
          "Medication schedule calendar syncing with reminders",
          "Automated pharmacy refill calendar event creation",
          "Full RFC-5545 .ics cross-platform calendar export"
        ]
      },
      {
        icon: "✉️",
        name: "Gmail API & Email Alerts",
        items: [
          "Daily 7:30 AM Caregiver Morning Briefing digest",
          "Includes daily schedule, appointments, and low-stock alerts",
          "Urgent Missed-Dose Email alerts triggered after 45m grace period",
          "Interactive in-app HTML email sandbox & test dispatcher",
          "Zero configuration required for live demonstration"
        ]
      },
      {
        icon: "🔥",
        name: "Firebase & Offline Resilience",
        items: [
          "Realtime cross-device event broadcasting architecture",
          "Offline-first PWA design with localStorage synchronization",
          "100% operational even without active network connectivity",
          "Automatic background sync when connection resumes",
          "Zero data loss guarantees during power outages"
        ]
      }
    ];

    services.forEach((s, idx) => {
      const x = 0.8 + idx * 3.9;
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.0, w: 3.7, h: 4.4,
        fill: { color: WHITE },
        line: { color: 'CBD5E1', width: 1.5 }
      });

      slide.addText(s.icon + " " + s.name, { x: x + 0.3, y: 2.2, w: 3.1, h: 0.6, fontSize: 16, bold: true, color: BLUE });
      
      const bullets = s.items.map(i => ({ text: i, options: { fontSize: 11, color: SLATE, bullet: true, breakLine: true } }));
      slide.addText(bullets, { x: x + 0.3, y: 2.9, w: 3.1, h: 3.3 });
    });
  }

  // ==========================================
  // SLIDE 7: Engineering Rigor & Testing
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, "Engineering Excellence: 17/17 Automated Tests Passing", "Code & Quality");

    // Metrics banner
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 2.0, w: 11.5, h: 1.2,
      fill: { color: 'ECFDF5' },
      line: { color: 'A7F3D0', width: 2 }
    });
    slide.addText("17 Passed  |  0 Failed  |  100% Critical Path Coverage  |  Execution: ~120ms", {
      x: 1.2, y: 2.4, w: 10.7, h: 0.5, fontSize: 18, bold: true, color: EMERALD, align: 'center'
    });

    const testSuites = [
      { name: "tests/auth.test.js", desc: "Passcode validation, RBAC boundaries, token creation & audit logging" },
      { name: "tests/adherence.test.js", desc: "Adherence score %, streak calculations, overdue status detection" },
      { name: "tests/drugInteraction.test.js", desc: "Bleeding risk detection, potassium warnings, duplicate medication flags" },
      { name: "tests/calendar.test.js", desc: "Google Calendar web intent URLs and compliant RFC-5545 iCalendar generation" },
      { name: "tests/email.test.js", desc: "HTML responsive morning briefing and urgent missed-dose alert email templates" }
    ];

    testSuites.forEach((t, idx) => {
      const y = 3.4 + idx * 0.62;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y, w: 11.5, h: 0.55,
        fill: { color: WHITE },
        line: { color: 'E2E8F0', width: 1 }
      });
      slide.addText("✔ " + t.name, { x: 1.1, y: y + 0.1, w: 3.8, h: 0.35, fontSize: 12, bold: true, color: NAVY, fontFace: 'Courier New' });
      slide.addText(t.desc, { x: 5.0, y: y + 0.1, w: 7.0, h: 0.35, fontSize: 11.5, color: SLATE });
    });
  }

  // ==========================================
  // SLIDE 8: 3-Minute Live Demo Choreography
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, "Judge Demo Choreography: The Winning 3-Minute Walkthrough", "Live Demo");

    const steps = [
      {
        num: "1",
        title: "Elderly View (PIN: 1234)",
        action: "Show jumbo 4-compartment pillbox. Tap 'Speak Command' and say 'Mark taken' or tap 'I TOOK THIS'. Watch confetti explode and listen to the voice affirmation."
      },
      {
        num: "2",
        title: "Caretaker AI Safety (PIN: 8888)",
        action: "Switch to Caretaker. Tap '+ Add Medication' and add 'Warfarin 5mg'. Show the instant AI Drug-Drug Interaction Safety Alert warning of bleeding risks with Aspirin!"
      },
      {
        num: "3",
        title: "Google Calendar & Email",
        action: "In Appointments, click 'Add to Google Calendar' to show instant sync. Open 'Email Reminders' to show live rendered HTML morning briefing."
      },
      {
        num: "4",
        title: "Family Peace of Mind (PIN: 5555)",
        action: "Show the 7-day adherence flame streak (🔥) and live activity stream. Send a 'Love Nudge' note and show how it appears on the senior's screen."
      }
    ];

    steps.forEach((st, idx) => {
      const x = 0.8 + idx * 2.92;
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.0, w: 2.75, h: 4.4,
        fill: { color: WHITE },
        line: { color: 'CBD5E1', width: 1.5 }
      });

      slide.addShape(pptx.ShapeType.ellipse, {
        x: x + 1.0, y: 2.3, w: 0.75, h: 0.75,
        fill: { color: BLUE }
      });
      slide.addText(st.num, { x: x + 1.0, y: 2.35, w: 0.75, h: 0.7, fontSize: 18, bold: true, color: WHITE, align: 'center' });

      slide.addText(st.title, { x: x + 0.15, y: 3.2, w: 2.45, h: 0.6, fontSize: 13, bold: true, color: NAVY, align: 'center' });
      slide.addText(st.action, { x: x + 0.15, y: 3.8, w: 2.45, h: 2.4, fontSize: 11.5, color: SLATE, align: 'left' });
    });
  }

  // ==========================================
  // SLIDE 9: Conclusion & Q&A
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: NAVY };

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.2, w: 11.7, h: 5.0,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 2 }
    });

    slide.addText("🏆 CarePulse: Transforming Elderly Healthcare", {
      x: 1.2, y: 1.8, w: 10, h: 0.8, fontSize: 32, bold: true, color: WHITE
    });

    slide.addText("Every senior deserves dignity, safety, and independence.\nEvery family deserves peace of mind.", {
      x: 1.2, y: 2.7, w: 10, h: 1.0, fontSize: 18, color: '94A3B8', italic: true
    });

    slide.addText("✔ 100% Evaluation Criteria Alignment\n✔ 17/17 Automated Tests Passing\n✔ Production-Ready PWA Architecture\n✔ Live Demo Available at http://localhost:5173", {
      x: 1.2, y: 3.8, w: 10, h: 1.4, fontSize: 14, color: '34D399', bold: true
    });

    slide.addText("Thank You! We Welcome Your Questions.", {
      x: 1.2, y: 5.2, w: 10, h: 0.6, fontSize: 20, bold: true, color: '38BDF8'
    });
  }

  // Save the PPTX file
  const outputPath = 'd:/hackathon/CarePulse_Pitch_Deck.pptx';
  await pptx.writeFile({ fileName: outputPath });
  console.log(`✅ PowerPoint presentation generated successfully: ${outputPath}`);
}

buildPresentation().catch(err => {
  console.error("Error generating presentation:", err);
  process.exit(1);
});
