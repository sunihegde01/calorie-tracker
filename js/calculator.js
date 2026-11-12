// NutriPulse - Metabolic & Calorie Calculator Engine

const Calculator = {
  /**
   * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
   * For men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
   * For women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
   */
  calculateBMR(gender, weightKg, heightCm, age) {
    const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    return gender === "female" ? Math.round(base - 161) : Math.round(base + 5);
  },

  /**
   * Alternative Harris-Benedict (Revised) calculation for comparison
   */
  calculateBMRHarrisBenedict(gender, weightKg, heightCm, age) {
    if (gender === "female") {
      return Math.round(447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age));
    }
    return Math.round(88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age));
  },

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   */
  calculateTDEE(bmr, activityLevel) {
    const activity = CONFIG.ACTIVITY_LEVELS[activityLevel] || CONFIG.ACTIVITY_LEVELS.moderate;
    return Math.round(bmr * activity.factor);
  },

  /**
   * Calculate Goal-Adjusted Target Calories
   */
  calculateTargetCalories(tdee, goalKey, gender) {
    const goal = CONFIG.GOALS[goalKey] || CONFIG.GOALS.maintain;
    let target = tdee + goal.adjustment;

    // Safety floors for healthy sustainable nutrition
    const minCalories = gender === "female" ? 1200 : 1500;
    if (target < minCalories) {
      target = minCalories;
    }
    return Math.round(target);
  },

  /**
   * Calculate Body Mass Index (BMI)
   * BMI = weight (kg) / [height (m)]^2
   */
  calculateBMI(weightKg, heightCm) {
    if (!heightCm || heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return parseFloat(bmi.toFixed(1));
  },

  /**
   * Determine BMI Category and styling
   */
  getBMICategory(bmi) {
    if (bmi < 18.5) {
      return {
        label: "Underweight",
        color: "text-blue-400",
        bg: "bg-blue-500/15 border-blue-500/30",
        description: "Below the standard healthy range. Consider consulting a nutritionist.",
        range: "< 18.5",
        status: "under"
      };
    } else if (bmi <= 24.9) {
      return {
        label: "Normal / Healthy Weight",
        color: "text-emerald-400",
        bg: "bg-emerald-500/15 border-emerald-500/30",
        description: "Great job! Your weight is in the optimal healthy range for your height.",
        range: "18.5 – 24.9",
        status: "normal"
      };
    } else if (bmi <= 29.9) {
      return {
        label: "Overweight",
        color: "text-amber-400",
        bg: "bg-amber-500/15 border-amber-500/30",
        description: "Slightly above normal range. Moderate caloric deficit & activity advised.",
        range: "25.0 – 29.9",
        status: "over"
      };
    } else {
      return {
        label: "Obese",
        color: "text-rose-400",
        bg: "bg-rose-500/15 border-rose-500/30",
        description: "Significantly above recommended range. Recommended structured health plan.",
        range: "≥ 30.0",
        status: "obese"
      };
    }
  },

  /**
   * Calculate Ideal Body Weight Range based on normal BMI (18.5 - 24.9)
   */
  getIdealWeightRange(heightCm) {
    const heightM = heightCm / 100;
    const minKg = 18.5 * (heightM * heightM);
    const maxKg = 24.9 * (heightM * heightM);
    return {
      minKg: parseFloat(minKg.toFixed(1)),
      maxKg: parseFloat(maxKg.toFixed(1))
    };
  },

  /**
   * Calculate daily recommended water intake in ml
   * Base: ~35ml per kg body weight + activity bonus
   */
  calculateWaterTarget(weightKg, activityLevel) {
    let base = weightKg * 35;
    const bonus = {
      sedentary: 0,
      light: 250,
      moderate: 500,
      very: 750,
      extra: 1000
    }[activityLevel] || 350;

    return Math.round(base + bonus);
  },

  /**
   * Calculate Macronutrient distribution in grams and calories
   * Protein: 4 kcal/g | Carbs: 4 kcal/g | Fat: 9 kcal/g
   */
  calculateMacros(targetCalories, macroPresetKey, customCarbs = 40, customProtein = 30, customFat = 30) {
    let carbsPct, proteinPct, fatPct;

    if (macroPresetKey === "custom") {
      carbsPct = Number(customCarbs) || 40;
      proteinPct = Number(customProtein) || 30;
      fatPct = Number(customFat) || 30;
    } else {
      const preset = CONFIG.MACRO_PRESETS[macroPresetKey] || CONFIG.MACRO_PRESETS.balanced;
      carbsPct = preset.carbs;
      proteinPct = preset.protein;
      fatPct = preset.fat;
    }

    // Ensure sum equals 100
    const total = carbsPct + proteinPct + fatPct;
    if (total !== 100 && total > 0) {
      carbsPct = Math.round((carbsPct / total) * 100);
      proteinPct = Math.round((proteinPct / total) * 100);
      fatPct = 100 - carbsPct - proteinPct;
    }

    const proteinCalories = (targetCalories * (proteinPct / 100));
    const carbsCalories = (targetCalories * (carbsPct / 100));
    const fatCalories = (targetCalories * (fatPct / 100));

    const proteinGrams = Math.round(proteinCalories / 4);
    const carbsGrams = Math.round(carbsCalories / 4);
    const fatGrams = Math.round(fatCalories / 9);

    return {
      carbs: {
        percent: carbsPct,
        grams: carbsGrams,
        calories: Math.round(carbsCalories)
      },
      protein: {
        percent: proteinPct,
        grams: proteinGrams,
        calories: Math.round(proteinCalories)
      },
      fat: {
        percent: fatPct,
        grams: fatGrams,
        calories: Math.round(fatCalories)
      }
    };
  },

  /**
   * Estimate calories burned for an activity
   * Calories = MET * weight_kg * (duration_minutes / 60)
   */
  calculateExerciseCalories(met, weightKg, durationMinutes) {
    if (!met || !weightKg || !durationMinutes) return 0;
    const hours = durationMinutes / 60;
    return Math.round(met * weightKg * hours);
  },

  // Conversions
  kgToLbs(kg) {
    return parseFloat((kg * 2.20462).toFixed(1));
  },

  lbsToKg(lbs) {
    return parseFloat((lbs / 2.20462).toFixed(1));
  },

  cmToFeetInches(cm) {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  },

  feetInchesToCm(feet, inches) {
    const totalInches = (Number(feet) * 12) + Number(inches);
    return Math.round(totalInches * 2.54);
  }
};

if (typeof window !== "undefined") {
  window.Calculator = Calculator;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = Calculator;
}
