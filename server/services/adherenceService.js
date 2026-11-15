// Medication Adherence & Analytics Engine
// Computes compliance percentages, streaks, compartment statistics, and missed dose alerts.

export class AdherenceService {
  /**
   * Calculate comprehensive adherence metrics from medication logs.
   * @param {Array<object>} logs Adherence log entries
   * @param {Array<object>} medications Medication list
   * @returns {object} Metrics object
   */
  static calculateMetrics(logs = [], medications = []) {
    if (!logs.length) {
      return {
        overallPercentage: 100,
        totalScheduled: 0,
        takenCount: 0,
        skippedCount: 0,
        missedCount: 0,
        streakDays: 0,
        compartmentBreakdown: { morning: 100, afternoon: 100, evening: 100, night: 100 },
        recentActivity: []
      };
    }

    let takenCount = 0;
    let skippedCount = 0;
    let missedCount = 0;

    const compartmentStats = {
      morning: { taken: 0, total: 0 },
      afternoon: { taken: 0, total: 0 },
      evening: { taken: 0, total: 0 },
      night: { taken: 0, total: 0 }
    };

    // Medication lookup map
    const medMap = new Map(medications.map(m => [m.id, m]));

    // Group logs by date to compute streak
    const dateGroups = new Map();

    for (const log of logs) {
      const status = log.status ? log.status.toLowerCase() : "taken";
      if (status === "taken") takenCount++;
      else if (status === "skipped") skippedCount++;
      else if (status === "missed") missedCount++;

      // Compartment analysis
      const med = medMap.get(log.medicationId);
      const compartment = (med && med.compartment) || "morning";
      if (compartmentStats[compartment]) {
        compartmentStats[compartment].total++;
        if (status === "taken") {
          compartmentStats[compartment].taken++;
        }
      }

      // Date grouping
      const dateKey = log.date || (log.timestamp ? log.timestamp.split('T')[0] : "unknown");
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, { total: 0, taken: 0 });
      }
      const day = dateGroups.get(dateKey);
      day.total++;
      if (status === "taken") day.taken++;
    }

    const totalLogged = takenCount + skippedCount + missedCount;
    const overallPercentage = totalLogged > 0 ? Math.round((takenCount / totalLogged) * 100) : 100;

    // Calculate Streak (consecutive days with 100% adherence ending on latest date)
    const sortedDates = Array.from(dateGroups.keys()).sort().reverse();
    let streakDays = 0;
    for (const d of sortedDates) {
      const day = dateGroups.get(d);
      if (day.total > 0 && day.taken === day.total) {
        streakDays++;
      } else {
        break;
      }
    }

    // Compartment percentages
    const compartmentBreakdown = {};
    for (const [key, val] of Object.entries(compartmentStats)) {
      compartmentBreakdown[key] = val.total > 0 ? Math.round((val.taken / val.total) * 100) : 100;
    }

    return {
      overallPercentage,
      totalScheduled: totalLogged,
      takenCount,
      skippedCount,
      missedCount,
      streakDays,
      compartmentBreakdown,
      recentActivity: logs.slice(-10).reverse()
    };
  }

  /**
   * Check for medications running dangerously low on stock.
   */
  static getRefillAlerts(medications = []) {
    return medications
      .filter(m => m.active && m.remainingCount <= (m.refillThreshold || 7))
      .map(m => ({
        medicationId: m.id,
        name: m.name,
        dosage: m.dosage,
        remainingCount: m.remainingCount,
        refillThreshold: m.refillThreshold || 7,
        urgent: m.remainingCount <= 3,
        daysLeftEstimate: Math.max(1, m.remainingCount)
      }));
  }

  /**
   * Determine today's pending doses and flag overdue medications.
   */
  static getTodaySchedule(medications = [], logs = [], referenceDate = new Date()) {
    const dateStr = referenceDate.toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.date === dateStr || (l.timestamp && l.timestamp.startsWith(dateStr)));
    const loggedMedIds = new Set(todayLogs.map(l => l.medicationId));

    const currentHours = referenceDate.getHours();
    const currentMinutes = referenceDate.getMinutes();
    const currentMinsTotal = currentHours * 60 + currentMinutes;

    return medications.filter(m => m.active).map(med => {
      const log = todayLogs.find(l => l.medicationId === med.id);
      const [h, m] = med.time.split(':').map(Number);
      const scheduledMins = h * 60 + m;

      let status = "pending";
      if (log) {
        status = log.status; // "taken", "skipped"
      } else if (currentMinsTotal > scheduledMins + 45) {
        // More than 45 minutes past scheduled time
        status = "overdue";
      }

      return {
        ...med,
        status,
        loggedAt: log ? log.timestamp : null,
        isOverdue: status === "overdue"
      };
    });
  }
}
