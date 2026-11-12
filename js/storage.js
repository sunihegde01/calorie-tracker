// NutriPulse - LocalStorage & State Management

const Storage = {
  STATE: null,

  /**
   * Initialize state from localStorage or load defaults
   */
  init() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (raw) {
        this.STATE = JSON.parse(raw);
        // Ensure structure validity
        this.validateStateStructure();
      } else {
        this.loadInitialDemoState();
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
      this.loadInitialDemoState();
    }
    return this.STATE;
  },

  /**
   * Save current state to localStorage
   */
  save() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.STATE));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  },

  /**
   * Ensure necessary fields are initialized in STATE
   */
  validateStateStructure() {
    if (!this.STATE.profile) {
      this.STATE.profile = { ...CONFIG.DEFAULT_PROFILE };
    }
    if (!this.STATE.dailyLogs) {
      this.STATE.dailyLogs = {};
    }
    if (!this.STATE.weightHistory) {
      this.STATE.weightHistory = [];
    }
    if (!this.STATE.customFoods) {
      this.STATE.customFoods = [];
    }
    if (!this.STATE.theme) {
      this.STATE.theme = "dark";
    }
  },

  /**
   * Get user profile
   */
  getProfile() {
    return this.STATE.profile;
  },

  /**
   * Update and save user profile
   */
  updateProfile(newProfile) {
    this.STATE.profile = { ...this.STATE.profile, ...newProfile };
    this.save();
    return this.STATE.profile;
  },

  /**
   * Format Date to YYYY-MM-DD
   */
  formatDateKey(date = new Date()) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  /**
   * Get or create daily log for a given date
   */
  getDailyLog(dateKey) {
    if (!this.STATE.dailyLogs[dateKey]) {
      this.STATE.dailyLogs[dateKey] = {
        date: dateKey,
        waterMl: 0,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        },
        exercises: [],
        weightLogged: null,
        notes: ""
      };
      this.save();
    }
    return this.STATE.dailyLogs[dateKey];
  },

  /**
   * Add food entry to a specific meal on a date
   */
  addFoodToMeal(dateKey, mealType, foodItem) {
    const day = this.getDailyLog(dateKey);
    if (!day.meals[mealType]) {
      day.meals[mealType] = [];
    }
    const item = {
      id: "entry_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      name: foodItem.name,
      serving: foodItem.serving || "1 serving",
      portionMultiplier: Number(foodItem.portionMultiplier) || 1,
      calories: Math.round(Number(foodItem.calories) * (foodItem.portionMultiplier || 1)),
      protein: Math.round(Number(foodItem.protein || 0) * (foodItem.portionMultiplier || 1)),
      carbs: Math.round(Number(foodItem.carbs || 0) * (foodItem.portionMultiplier || 1)),
      fat: Math.round(Number(foodItem.fat || 0) * (foodItem.portionMultiplier || 1)),
      category: foodItem.category || "Custom",
      loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    day.meals[mealType].push(item);
    this.save();
    return item;
  },

  /**
   * Remove food entry
   */
  removeFoodFromMeal(dateKey, mealType, itemId) {
    const day = this.getDailyLog(dateKey);
    if (day.meals[mealType]) {
      day.meals[mealType] = day.meals[mealType].filter(item => item.id !== itemId);
      this.save();
    }
  },

  /**
   * Add an exercise record to a day
   */
  addExercise(dateKey, exerciseData) {
    const day = this.getDailyLog(dateKey);
    const exercise = {
      id: "ex_" + Date.now(),
      name: exerciseData.name,
      durationMinutes: Number(exerciseData.durationMinutes),
      caloriesBurned: Math.round(Number(exerciseData.caloriesBurned)),
      category: exerciseData.category || "General",
      icon: exerciseData.icon || "fa-fire",
      loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    day.exercises.push(exercise);
    this.save();
    return exercise;
  },

  /**
   * Remove exercise record
   */
  removeExercise(dateKey, exerciseId) {
    const day = this.getDailyLog(dateKey);
    day.exercises = day.exercises.filter(ex => ex.id !== exerciseId);
    this.save();
  },

  /**
   * Update hydration water intake
   */
  updateWater(dateKey, deltaMl) {
    const day = this.getDailyLog(dateKey);
    const current = Number(day.waterMl || 0);
    day.waterMl = Math.max(0, current + deltaMl);
    this.save();
    return day.waterMl;
  },

  /**
   * Set exact hydration water intake
   */
  setWater(dateKey, exactMl) {
    const day = this.getDailyLog(dateKey);
    day.waterMl = Math.max(0, exactMl);
    this.save();
    return day.waterMl;
  },

  /**
   * Record weight entry for a date
   */
  logWeight(dateKey, weightKg) {
    const day = this.getDailyLog(dateKey);
    day.weightLogged = Number(weightKg);

    // Update weight history
    const existingIndex = this.STATE.weightHistory.findIndex(w => w.date === dateKey);
    if (existingIndex >= 0) {
      this.STATE.weightHistory[existingIndex].weight = Number(weightKg);
    } else {
      this.STATE.weightHistory.push({
        date: dateKey,
        weight: Number(weightKg)
      });
      // Sort chronologically
      this.STATE.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Also update current weight in profile
    this.STATE.profile.weightKg = Number(weightKg);
    this.save();
  },

  /**
   * Add custom user food to local library
   */
  addCustomFood(food) {
    const customFood = {
      id: "custom_" + Date.now(),
      name: food.name,
      serving: food.serving || "1 serving",
      calories: Number(food.calories),
      protein: Number(food.protein || 0),
      carbs: Number(food.carbs || 0),
      fat: Number(food.fat || 0),
      category: food.category || "Custom"
    };
    this.STATE.customFoods.push(customFood);
    this.save();
    return customFood;
  },

  /**
   * Search all foods (Pre-defined + User Custom)
   */
  searchFoods(query = "", category = "all") {
    const q = query.trim().toLowerCase();
    const all = [...CONFIG.FOOD_DATABASE, ...this.STATE.customFoods];

    return all.filter(item => {
      const matchesText = !q || item.name.toLowerCase().includes(q) || (item.category && item.category.toLowerCase().includes(q));
      const matchesCat = category === "all" || (item.category && item.category.toLowerCase() === category.toLowerCase());
      return matchesText && matchesCat;
    });
  },

  /**
   * Calculate totals for a given day
   */
  getDayTotals(dateKey) {
    const day = this.getDailyLog(dateKey);
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealTotals = {
      breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      lunch: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      dinner: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      snacks: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    };

    ["breakfast", "lunch", "dinner", "snacks"].forEach(meal => {
      const items = day.meals[meal] || [];
      items.forEach(item => {
        mealTotals[meal].calories += item.calories || 0;
        mealTotals[meal].protein += item.protein || 0;
        mealTotals[meal].carbs += item.carbs || 0;
        mealTotals[meal].fat += item.fat || 0;

        totalCalories += item.calories || 0;
        totalProtein += item.protein || 0;
        totalCarbs += item.carbs || 0;
        totalFat += item.fat || 0;
      });
    });

    let totalExerciseBurned = 0;
    (day.exercises || []).forEach(ex => {
      totalExerciseBurned += ex.caloriesBurned || 0;
    });

    const target = this.STATE.profile.targetCalories || 2000;
    const remaining = target - totalCalories + totalExerciseBurned;

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalExerciseBurned,
      remainingCalories: remaining,
      waterMl: day.waterMl || 0,
      mealTotals
    };
  },

  /**
   * Get past 7 days log summary for trends
   */
  getPastDaysSummary(numDays = 7) {
    const results = [];
    const today = new Date();

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = this.formatDateKey(d);
      const totals = this.getDayTotals(key);
      const dayLog = this.getDailyLog(key);

      const dayName = d.toLocaleDateString(undefined, { weekday: "short" });
      const dateDisplay = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

      results.push({
        dateKey: key,
        dayName,
        dateDisplay,
        consumed: totals.totalCalories,
        burned: totals.totalExerciseBurned,
        target: this.STATE.profile.targetCalories || 2000,
        protein: totals.totalProtein,
        carbs: totals.totalCarbs,
        fat: totals.totalFat,
        waterMl: totals.waterMl,
        weight: dayLog.weightLogged
      });
    }

    return results;
  },

  /**
   * Pre-load realistic demo state with complete history
   */
  loadInitialDemoState() {
    const today = new Date();
    const todayKey = this.formatDateKey(today);

    // Initial default profile
    const profile = { ...CONFIG.DEFAULT_PROFILE };
    // Recalculate based on profile params
    const bmr = Calculator.calculateBMR(profile.gender, profile.weightKg, profile.heightCm, profile.age);
    const tdee = Calculator.calculateTDEE(bmr, profile.activityLevel);
    const targetCalories = Calculator.calculateTargetCalories(tdee, profile.goal, profile.gender);
    const waterTarget = Calculator.calculateWaterTarget(profile.weightKg, profile.activityLevel);

    profile.bmr = bmr;
    profile.tdee = tdee;
    profile.targetCalories = targetCalories;
    profile.targetWaterMl = waterTarget;

    const dailyLogs = {};
    const weightHistory = [];

    // Generate past 7 days realistic data
    const sampleWeights = [77.6, 77.3, 77.1, 76.8, 76.9, 76.6, 76.5];
    const sampleFoodsToday = {
      breakfast: [
        { name: "Rolled Oats (Dry)", serving: "50g", calories: 190, protein: 6, carbs: 34, fat: 3 },
        { name: "Whey Protein Powder (1 scoop)", serving: "30g", calories: 120, protein: 24, carbs: 2, fat: 1 },
        { name: "Blueberries (Fresh)", serving: "100g", calories: 57, protein: 1, carbs: 14, fat: 0 }
      ],
      lunch: [
        { name: "Chicken Breast (Cooked, Skinless)", serving: "150g", calories: 248, protein: 46, carbs: 0, fat: 5 },
        { name: "Basmati Brown Rice (Cooked)", serving: "150g", calories: 165, protein: 4, carbs: 35, fat: 1 },
        { name: "Mixed Green Salad", serving: "1 bowl", calories: 25, protein: 1, carbs: 4, fat: 0 },
        { name: "Extra Virgin Olive Oil", serving: "1 tbsp", calories: 119, protein: 0, carbs: 0, fat: 14 }
      ],
      dinner: [
        { name: "Salmon Fillet (Grilled)", serving: "150g", calories: 300, protein: 34, carbs: 0, fat: 18 },
        { name: "Sweet Potato (Baked)", serving: "150g", calories: 135, protein: 3, carbs: 31, fat: 0 },
        { name: "Broccoli (Steamed)", serving: "100g", calories: 35, protein: 2, carbs: 7, fat: 0 }
      ],
      snacks: [
        { name: "Greek Yogurt (0% Fat)", serving: "170g", calories: 100, protein: 18, carbs: 6, fat: 0 },
        { name: "Almonds (Raw)", serving: "30g", calories: 173, protein: 6, carbs: 6, fat: 15 },
        { name: "Apple with skin", serving: "1 medium", calories: 95, protein: 0, carbs: 25, fat: 0 }
      ]
    };

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = this.formatDateKey(d);
      const wt = sampleWeights[6 - i];

      weightHistory.push({
        date: k,
        weight: wt
      });

      if (i === 0) {
        // Today's log
        dailyLogs[k] = {
          date: k,
          waterMl: 2000,
          meals: {
            breakfast: sampleFoodsToday.breakfast.map((f, idx) => ({ ...f, id: "demo_b_" + idx, portionMultiplier: 1 })),
            lunch: sampleFoodsToday.lunch.map((f, idx) => ({ ...f, id: "demo_l_" + idx, portionMultiplier: 1 })),
            dinner: sampleFoodsToday.dinner.map((f, idx) => ({ ...f, id: "demo_d_" + idx, portionMultiplier: 1 })),
            snacks: sampleFoodsToday.snacks.map((f, idx) => ({ ...f, id: "demo_s_" + idx, portionMultiplier: 1 }))
          },
          exercises: [
            {
              id: "demo_ex_1",
              name: "Running (6 mph / 10 km/h)",
              durationMinutes: 30,
              caloriesBurned: 375,
              category: "Cardio",
              icon: "fa-person-running",
              loggedAt: "07:30 AM"
            },
            {
              id: "demo_ex_2",
              name: "Weight Lifting (Moderate effort)",
              durationMinutes: 40,
              caloriesBurned: 255,
              category: "Strength",
              icon: "fa-dumbbell",
              loggedAt: "05:15 PM"
            }
          ],
          weightLogged: wt,
          notes: "Felt very energetic during workout today!"
        };
      } else {
        // Past days with realistic calorie totals around target
        const calorieOffsets = [-120, 80, -40, 150, -80, 20];
        const offset = calorieOffsets[i - 1] || 0;
        const totalPastCal = profile.targetCalories + offset;

        dailyLogs[k] = {
          date: k,
          waterMl: 2250 + (i * 100),
          meals: {
            breakfast: [{ id: `past_b_${i}`, name: "Oatmeal & Eggs", serving: "1 bowl", calories: 420, protein: 28, carbs: 45, fat: 12, portionMultiplier: 1 }],
            lunch: [{ id: `past_l_${i}`, name: "Chicken Rice Bowl", serving: "1 plate", calories: 650, protein: 48, carbs: 65, fat: 18, portionMultiplier: 1 }],
            dinner: [{ id: `past_d_${i}`, name: "Steak / Salmon & Veggies", serving: "1 plate", calories: 580, protein: 42, carbs: 32, fat: 22, portionMultiplier: 1 }],
            snacks: [{ id: `past_s_${i}`, name: "Protein Shake & Nuts", serving: "1 shake", calories: totalPastCal - (420 + 650 + 580), protein: 26, carbs: 18, fat: 10, portionMultiplier: 1 }]
          },
          exercises: [
            {
              id: `past_ex_${i}`,
              name: i % 2 === 0 ? "Brisk Walking" : "Strength Training",
              durationMinutes: 45,
              caloriesBurned: i % 2 === 0 ? 230 : 310,
              category: i % 2 === 0 ? "Cardio" : "Strength",
              icon: i % 2 === 0 ? "fa-person-walking" : "fa-dumbbell",
              loggedAt: "06:00 PM"
            }
          ],
          weightLogged: wt,
          notes: "Consistent on target."
        };
      }
    }

    this.STATE = {
      profile,
      dailyLogs,
      weightHistory,
      customFoods: [
        { id: "cust_1", name: "Grandma's Lentil Soup", serving: "1 bowl (300ml)", calories: 240, protein: 16, carbs: 36, fat: 4, category: "Custom" },
        { id: "cust_2", name: "Matcha Protein Latte", serving: "350ml", calories: 155, protein: 18, carbs: 8, fat: 3, category: "Custom" }
      ],
      theme: "dark"
    };

    this.save();
    return this.STATE;
  },

  /**
   * Export all data to JSON
   */
  exportData() {
    return JSON.stringify(this.STATE, null, 2);
  },

  /**
   * Import data from JSON
   */
  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.profile || !parsed.dailyLogs) {
        throw new Error("Invalid format: profile or dailyLogs missing.");
      }
      this.STATE = parsed;
      this.validateStateStructure();
      this.save();
      return true;
    } catch (e) {
      console.error("Import error:", e);
      return false;
    }
  },

  /**
   * Reset everything to factory default state
   */
  resetAll() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    this.loadInitialDemoState();
  }
};

if (typeof window !== "undefined") {
  window.Storage = Storage;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = Storage;
}
