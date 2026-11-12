// NutriPulse - Configuration, Food & Exercise Databases, and Presets

const CONFIG = {
  APP_NAME: "NutriPulse",
  APP_TAGLINE: "Smart Calorie & Metabolic Health Tracker",
  VERSION: "1.0.0",
  STORAGE_KEY: "nutripulse_app_state_v1",

  // Activity multipliers for Harris-Benedict / Mifflin-St Jeor TDEE
  ACTIVITY_LEVELS: {
    sedentary: {
      factor: 1.2,
      label: "Sedentary",
      description: "Desk job, little to no regular exercise",
      icon: "fa-couch"
    },
    light: {
      factor: 1.375,
      label: "Lightly Active",
      description: "Light exercise or sports 1-3 days per week",
      icon: "fa-person-walking"
    },
    moderate: {
      factor: 1.55,
      label: "Moderately Active",
      description: "Moderate exercise or sports 3-5 days per week",
      icon: "fa-person-running"
    },
    very: {
      factor: 1.725,
      label: "Very Active",
      description: "Hard exercise or intense sports 6-7 days per week",
      icon: "fa-dumbbell"
    },
    extra: {
      factor: 1.9,
      label: "Extremely Active",
      description: "Physical job, intense daily training or 2x per day",
      icon: "fa-fire"
    }
  },

  // Calorie adjustments relative to TDEE
  GOALS: {
    lose_fast: {
      adjustment: -750,
      label: "Fast Weight Loss",
      sublabel: "Approx. -0.75 kg / -1.6 lbs per week",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20"
    },
    lose_steady: {
      adjustment: -500,
      label: "Steady Weight Loss",
      sublabel: "Approx. -0.5 kg / -1.1 lbs per week (Recommended)",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    lose_mild: {
      adjustment: -250,
      label: "Mild Weight Loss",
      sublabel: "Approx. -0.25 kg / -0.55 lbs per week",
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20"
    },
    maintain: {
      adjustment: 0,
      label: "Maintain Weight",
      sublabel: "Keep weight stable & build sustainable habits",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    },
    gain_mild: {
      adjustment: 250,
      label: "Lean Muscle Gain",
      sublabel: "Approx. +0.25 kg / +0.55 lbs per week",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    },
    gain_fast: {
      adjustment: 500,
      label: "Bulking / Weight Gain",
      sublabel: "Approx. +0.5 kg / +1.1 lbs per week",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    }
  },

  // Macro distribution presets (% of total calories: Carbs, Protein, Fat)
  MACRO_PRESETS: {
    balanced: {
      label: "Balanced Health",
      carbs: 45,
      protein: 25,
      fat: 30,
      desc: "45% Carbs / 25% Protein / 30% Fat - Great for everyday wellness"
    },
    high_protein: {
      label: "High Protein / Fitness",
      carbs: 35,
      protein: 40,
      fat: 25,
      desc: "35% Carbs / 40% Protein / 25% Fat - Optimal for muscle preservation & satiety"
    },
    low_carb: {
      label: "Low Carb",
      carbs: 20,
      protein: 40,
      fat: 40,
      desc: "20% Carbs / 40% Protein / 40% Fat - Steady energy and lower insulin spikes"
    },
    keto: {
      label: "Ketogenic",
      carbs: 5,
      protein: 25,
      fat: 70,
      desc: "5% Carbs / 25% Protein / 70% Fat - High fat, minimal carb ketosis"
    },
    custom: {
      label: "Custom Ratio",
      carbs: 40,
      protein: 30,
      fat: 30,
      desc: "User defined percentage distribution"
    }
  },

  // Default User Profile
  DEFAULT_PROFILE: {
    name: "Alex Morgan",
    age: 26,
    gender: "male", // 'male' or 'female'
    heightCm: 178,
    weightKg: 76.5,
    targetWeightKg: 72.0,
    unitSystem: "metric", // 'metric' (kg, cm) or 'imperial' (lbs, ft/in)
    activityLevel: "moderate",
    goal: "lose_steady",
    macroPreset: "high_protein",
    customCarbsPct: 35,
    customProteinPct: 40,
    customFatPct: 25,
    targetWaterMl: 2800,
    targetCalories: 2150,
    tdee: 2650,
    bmr: 1710,
    createdDate: "2026-11-01"
  },

  // Exercise MET values (Metabolic Equivalent of Task)
  // Calories = MET * weight_in_kg * (duration_minutes / 60)
  EXERCISE_DATABASE: [
    { id: "run_moderate", name: "Running (6 mph / 10 km/h)", met: 9.8, category: "Cardio", icon: "fa-person-running" },
    { id: "run_fast", name: "Running (8 mph / 13 km/h)", met: 11.8, category: "Cardio", icon: "fa-person-running" },
    { id: "walk_moderate", name: "Walking (Brisk, 3.5 mph / 5.6 km/h)", met: 3.8, category: "Cardio", icon: "fa-person-walking" },
    { id: "walk_leisure", name: "Walking (Casual, 2.5 mph / 4 km/h)", met: 2.8, category: "Cardio", icon: "fa-person-walking" },
    { id: "cycling_moderate", name: "Cycling (Moderate pace 12-14 mph)", met: 7.5, category: "Cardio", icon: "fa-bicycle" },
    { id: "cycling_vigorous", name: "Cycling (Stationary / Spin Class)", met: 8.5, category: "Cardio", icon: "fa-bicycle" },
    { id: "swimming_freestyle", name: "Swimming (Freestyle laps)", met: 8.0, category: "Cardio", icon: "fa-water-ladder" },
    { id: "hiit", name: "High-Intensity Interval Training (HIIT)", met: 8.5, category: "Cardio", icon: "fa-bolt" },
    { id: "jump_rope", name: "Jump Rope (Moderate intensity)", met: 10.0, category: "Cardio", icon: "fa-stopwatch" },
    { id: "strength_moderate", name: "Weight Lifting (Moderate effort)", met: 5.0, category: "Strength", icon: "fa-dumbbell" },
    { id: "strength_vigorous", name: "Weight Lifting (Intense/Powerlifting)", met: 6.0, category: "Strength", icon: "fa-dumbbell" },
    { id: "calisthenics", name: "Calisthenics / Bodyweight Workout", met: 5.5, category: "Strength", icon: "fa-person-chalkboard" },
    { id: "yoga_vinyasa", name: "Yoga (Vinyasa / Power Flow)", met: 3.5, category: "Flexibility", icon: "fa-spa" },
    { id: "yoga_hatha", name: "Yoga (Hatha / Gentle Stretch)", met: 2.5, category: "Flexibility", icon: "fa-spa" },
    { id: "pilates", name: "Pilates (Mat / Reformer)", met: 4.0, category: "Flexibility", icon: "fa-child-reaching" },
    { id: "basketball", name: "Basketball (Full court game)", met: 8.0, category: "Sports", icon: "fa-basketball" },
    { id: "football_soccer", name: "Football / Soccer (Match play)", met: 9.0, category: "Sports", icon: "fa-futbol" },
    { id: "tennis", name: "Tennis (Singles match)", met: 7.3, category: "Sports", icon: "fa-baseball" },
    { id: "badminton", name: "Badminton (Competitive)", met: 5.5, category: "Sports", icon: "fa-table-tennis-paddle-ball" },
    { id: "boxing", name: "Boxing / Sparring / Heavy Bag", met: 9.0, category: "Combat", icon: "fa-hand-fist" }
  ],

  // Pre-loaded nutritious foods database with accurate macros
  FOOD_DATABASE: [
    // Proteins
    { id: "f1", name: "Chicken Breast (Cooked, Skinless)", serving: "100g", calories: 165, protein: 31, carbs: 0, fat: 3.6, category: "Proteins" },
    { id: "f2", name: "Salmon Fillet (Grilled)", serving: "150g", calories: 300, protein: 34, carbs: 0, fat: 18, category: "Proteins" },
    { id: "f3", name: "Whole Eggs (Large)", serving: "2 eggs (100g)", calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, category: "Proteins" },
    { id: "f4", name: "Egg Whites", serving: "100g", calories: 52, protein: 11, carbs: 0.7, fat: 0.2, category: "Proteins" },
    { id: "f5", name: "Whey Protein Powder (1 scoop)", serving: "30g", calories: 120, protein: 24, carbs: 2.5, fat: 1.5, category: "Proteins" },
    { id: "f6", name: "Greek Yogurt (0% Fat)", serving: "170g", calories: 100, protein: 18, carbs: 6, fat: 0.5, category: "Dairy & Eggs" },
    { id: "f7", name: "Tuna (Canned in Water)", serving: "100g", calories: 116, protein: 26, carbs: 0, fat: 1, category: "Proteins" },
    { id: "f8", name: "Lean Ground Beef (90/10)", serving: "100g", calories: 195, protein: 26, carbs: 0, fat: 10, category: "Proteins" },
    { id: "f9", name: "Tofu (Firm)", serving: "100g", calories: 83, protein: 10, carbs: 2, fat: 5, category: "Proteins" },
    { id: "f10", name: "Paneer / Cottage Cheese", serving: "100g", calories: 200, protein: 18, carbs: 3, fat: 13, category: "Dairy & Eggs" },
    { id: "f11", name: "Shrimp / Prawns (Steamed)", serving: "100g", calories: 99, protein: 24, carbs: 0.2, fat: 0.3, category: "Proteins" },

    // Carbohydrates & Grains
    { id: "f12", name: "Rolled Oats (Dry)", serving: "50g", calories: 190, protein: 6.5, carbs: 34, fat: 3, category: "Grains & Carbs" },
    { id: "f13", name: "Basmati Brown Rice (Cooked)", serving: "150g", calories: 165, protein: 3.5, carbs: 35, fat: 1.2, category: "Grains & Carbs" },
    { id: "f14", name: "Jasmine White Rice (Cooked)", serving: "150g", calories: 195, protein: 4, carbs: 43, fat: 0.4, category: "Grains & Carbs" },
    { id: "f15", name: "Sweet Potato (Baked)", serving: "150g", calories: 135, protein: 3, carbs: 31, fat: 0.2, category: "Grains & Carbs" },
    { id: "f16", name: "Whole Wheat Bread", serving: "2 slices (60g)", calories: 160, protein: 8, carbs: 28, fat: 2, category: "Grains & Carbs" },
    { id: "f17", name: "Quinoa (Cooked)", serving: "150g", calories: 180, protein: 6.5, carbs: 32, fat: 2.8, category: "Grains & Carbs" },
    { id: "f18", name: "Whole Grain Pasta (Cooked)", serving: "140g", calories: 174, protein: 7.5, carbs: 37, fat: 0.8, category: "Grains & Carbs" },
    { id: "f19", name: "Roti / Whole Wheat Chapati", serving: "1 piece (40g)", calories: 105, protein: 3.2, carbs: 21, fat: 1.2, category: "Grains & Carbs" },

    // Fruits & Vegetables
    { id: "f20", name: "Banana (Medium)", serving: "1 medium (118g)", calories: 105, protein: 1.3, carbs: 27, fat: 0.3, category: "Fruits & Veggies" },
    { id: "f21", name: "Apple with skin", serving: "1 medium (180g)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: "Fruits & Veggies" },
    { id: "f22", name: "Blueberries (Fresh)", serving: "100g", calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, category: "Fruits & Veggies" },
    { id: "f23", name: "Strawberries (Fresh)", serving: "150g", calories: 48, protein: 1, carbs: 11.5, fat: 0.5, category: "Fruits & Veggies" },
    { id: "f24", name: "Broccoli (Steamed)", serving: "100g", calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, category: "Fruits & Veggies" },
    { id: "f25", name: "Spinach (Fresh Baby)", serving: "100g", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: "Fruits & Veggies" },
    { id: "f26", name: "Mixed Green Salad", serving: "1 bowl (120g)", calories: 25, protein: 1.5, carbs: 4.5, fat: 0.2, category: "Fruits & Veggies" },
    { id: "f27", name: "Avocado", serving: "half (100g)", calories: 160, protein: 2, carbs: 8.5, fat: 15, category: "Healthy Fats" },

    // Healthy Fats & Nuts
    { id: "f28", name: "Almonds (Raw)", serving: "30g (approx 23 nuts)", calories: 173, protein: 6, carbs: 6, fat: 15, category: "Healthy Fats" },
    { id: "f29", name: "Walnuts (Halves)", serving: "30g", calories: 196, protein: 4.5, carbs: 4, fat: 20, category: "Healthy Fats" },
    { id: "f30", name: "Peanut Butter (Natural)", serving: "2 tbsp (32g)", calories: 190, protein: 8, carbs: 7, fat: 16, category: "Healthy Fats" },
    { id: "f31", name: "Extra Virgin Olive Oil", serving: "1 tbsp (14ml)", calories: 119, protein: 0, carbs: 0, fat: 13.5, category: "Healthy Fats" },
    { id: "f32", name: "Chia Seeds", serving: "20g", calories: 98, protein: 3.3, carbs: 8.4, fat: 6.2, category: "Healthy Fats" },

    // Dairy & Beverages
    { id: "f33", name: "Cow Milk (Low Fat 1%)", serving: "240ml (1 cup)", calories: 102, protein: 8.2, carbs: 12.2, fat: 2.4, category: "Dairy & Eggs" },
    { id: "f34", name: "Unsweetened Almond Milk", serving: "240ml (1 cup)", calories: 30, protein: 1, carbs: 1, fat: 2.5, category: "Dairy & Eggs" },
    { id: "f35", name: "Black Coffee / Espresso", serving: "1 cup (200ml)", calories: 2, protein: 0.3, carbs: 0, fat: 0, category: "Drinks" },
    { id: "f36", name: "Green Tea (Unsweetened)", serving: "1 cup (240ml)", calories: 2, protein: 0, carbs: 0, fat: 0, category: "Drinks" },
    { id: "f37", name: "Coconut Water", serving: "250ml", calories: 45, protein: 0.5, carbs: 11, fat: 0.2, category: "Drinks" },

    // Popular meals & snacks
    { id: "f38", name: "Hummus with Carrot Sticks", serving: "1 serving", calories: 140, protein: 4, carbs: 18, fat: 7, category: "Snacks" },
    { id: "f39", name: "Protein Bar (Standard)", serving: "1 bar (60g)", calories: 210, protein: 20, carbs: 22, fat: 7, category: "Snacks" },
    { id: "f40", name: "Dark Chocolate (85% Cocoa)", serving: "25g", calories: 150, protein: 2.5, carbs: 9, fat: 12, category: "Snacks" }
  ]
};

// Make available globally in browser and node environments
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
