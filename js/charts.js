// NutriPulse - Chart.js Visualizations Controller

const AppCharts = {
  macroChartInstance: null,
  weeklyCalorieChartInstance: null,
  weightTrendChartInstance: null,

  /**
   * Return theme-aware color palette
   */
  getThemeColors() {
    const isDark = document.documentElement.classList.contains("dark") || !document.documentElement.classList.contains("light");
    return {
      isDark,
      textColor: isDark ? "#94a3b8" : "#475569",
      headingColor: isDark ? "#f1f5f9" : "#0f172a",
      gridColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
      tooltipBg: isDark ? "#0f172a" : "#ffffff",
      tooltipBorder: isDark ? "#334155" : "#e2e8f0",
      protein: "#10b981", // Emerald
      carbs: "#6366f1",   // Indigo
      fat: "#f59e0b",     // Amber
      targetLine: "#ec4899", // Pink
      calorieConsumed: "#3b82f6", // Blue
      calorieBurned: "#f97316"    // Orange
    };
  },

  /**
   * Render or update the Daily Macro Doughnut Chart
   */
  renderMacroDonut(proteinGrams, carbsGrams, fatGrams) {
    const canvas = document.getElementById("macroDonutChart");
    if (!canvas) return;

    const colors = this.getThemeColors();
    const ctx = canvas.getContext("2d");

    const totalGrams = (proteinGrams + carbsGrams + fatGrams) || 1;
    const hasData = (proteinGrams + carbsGrams + fatGrams) > 0;

    const dataValues = hasData ? [proteinGrams, carbsGrams, fatGrams] : [33, 33, 34];
    const bgColors = hasData
      ? [colors.protein, colors.carbs, colors.fat]
      : ["rgba(148, 163, 184, 0.2)", "rgba(148, 163, 184, 0.15)", "rgba(148, 163, 184, 0.1)"];

    if (this.macroChartInstance) {
      this.macroChartInstance.data.datasets[0].data = dataValues;
      this.macroChartInstance.data.datasets[0].backgroundColor = bgColors;
      this.macroChartInstance.update();
      return;
    }

    this.macroChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Protein", "Carbohydrates", "Fats"],
        datasets: [{
          data: dataValues,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: colors.isDark ? "#1e293b" : "#ffffff",
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "76%",
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.headingColor,
            bodyColor: colors.textColor,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            boxPadding: 4,
            callbacks: {
              label: function(context) {
                if (!hasData) return "No food logged yet";
                const grams = context.raw;
                const pct = Math.round((grams / totalGrams) * 100);
                return ` ${context.label}: ${grams}g (${pct}%)`;
              }
            }
          }
        },
        animation: {
          duration: 750,
          easing: "easeOutQuart"
        }
      }
    });
  },

  /**
   * Render or update 7-day Calorie Intake vs Burned/Target Chart
   */
  renderWeeklyCalorieChart(weeklyData) {
    const canvas = document.getElementById("weeklyCalorieChart");
    if (!canvas) return;

    const colors = this.getThemeColors();
    const ctx = canvas.getContext("2d");

    const labels = weeklyData.map(d => d.dayName);
    const consumed = weeklyData.map(d => d.consumed);
    const burned = weeklyData.map(d => d.burned);
    const targets = weeklyData.map(d => d.target);

    if (this.weeklyCalorieChartInstance) {
      this.weeklyCalorieChartInstance.destroy();
    }

    this.weeklyCalorieChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Food Consumed",
            data: consumed,
            backgroundColor: "rgba(59, 130, 246, 0.85)",
            borderColor: "#3b82f6",
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 18
          },
          {
            label: "Exercise Burned",
            data: burned,
            backgroundColor: "rgba(249, 115, 22, 0.85)",
            borderColor: "#f97316",
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 18
          },
          {
            label: "Target Calorie Budget",
            data: targets,
            type: "line",
            borderColor: "#10b981",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
            }
          },
          y: {
            grid: {
              color: colors.gridColor
            },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: val => val + " kcal"
            }
          }
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              usePointStyle: true,
              pointStyle: "circle"
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.headingColor,
            bodyColor: colors.textColor,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: context => ` ${context.dataset.label}: ${context.raw} kcal`
            }
          }
        }
      }
    });
  },

  /**
   * Render or update Weight Progress Trend Chart
   */
  renderWeightTrendChart(weightHistory, targetWeightKg) {
    const canvas = document.getElementById("weightTrendChart");
    if (!canvas) return;

    const colors = this.getThemeColors();
    const ctx = canvas.getContext("2d");

    // Format labels and points
    const labels = weightHistory.map(entry => {
      const parts = entry.date.split("-");
      return `${parts[1]}/${parts[2]}`;
    });
    const dataPoints = weightHistory.map(entry => entry.weight);
    const targetLineData = new Array(labels.length).fill(targetWeightKg);

    if (this.weightTrendChartInstance) {
      this.weightTrendChartInstance.destroy();
    }

    this.weightTrendChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Recorded Weight (kg)",
            data: dataPoints,
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.12)",
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: "#6366f1",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7
          },
          {
            label: `Goal Target (${targetWeightKg} kg)`,
            data: targetLineData,
            borderColor: "#ec4899",
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: colors.gridColor
            },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            }
          },
          y: {
            grid: {
              color: colors.gridColor
            },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: val => val + " kg"
            }
          }
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              usePointStyle: true,
              pointStyle: "circle"
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.headingColor,
            bodyColor: colors.textColor,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: context => ` ${context.dataset.label}: ${context.raw} kg`
            }
          }
        }
      }
    });
  },

  /**
   * Refresh all active charts on theme toggle or data mutation
   */
  refreshAll(weeklyData, weightHistory, targetWeight, protein, carbs, fat) {
    this.renderMacroDonut(protein, carbs, fat);
    if (weeklyData) {
      this.renderWeeklyCalorieChart(weeklyData);
    }
    if (weightHistory && targetWeight) {
      this.renderWeightTrendChart(weightHistory, targetWeight);
    }
  }
};

if (typeof window !== "undefined") {
  window.AppCharts = AppCharts;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = AppCharts;
}
