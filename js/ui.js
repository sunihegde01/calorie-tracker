// NutriPulse - UI Rendering & Interaction Module

const UI = {
  currentDateKey: null,
  activeMealType: "breakfast",

  init() {
    this.currentDateKey = Storage.formatDateKey(new Date());
  },

  /**
   * Show a styled toast alert notification
   */
  showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    const icons = {
      success: "fa-circle-check text-emerald-400",
      info: "fa-circle-info text-blue-400",
      warning: "fa-triangle-exclamation text-amber-400",
      error: "fa-circle-xmark text-rose-400"
    };

    const borders = {
      success: "border-emerald-500/30",
      info: "border-blue-500/30",
      warning: "border-amber-500/30",
      error: "border-rose-500/30"
    };

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 shadow-xl border ${borders[type] || borders.info} text-sm font-medium backdrop-blur-md transform transition-all duration-300 translate-y-2 opacity-0 z-50`;
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.info} text-base"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    });

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /**
   * Trigger celebration confetti
   */
  triggerCelebration() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  },

  /**
   * Render Top Header Date display
   */
  renderDateNavigation() {
    const dateInput = document.getElementById("datePickerInput");
    const dateDisplay = document.getElementById("currentDateDisplay");
    if (!dateInput || !dateDisplay) return;

    dateInput.value = this.currentDateKey;

    const todayKey = Storage.formatDateKey(new Date());
    const isToday = this.currentDateKey === todayKey;

    const dateObj = new Date(this.currentDateKey + "T00:00:00");
    const options = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    dateDisplay.innerHTML = `
      <span class="font-bold text-slate-100">${dateObj.toLocaleDateString(undefined, options)}</span>
      ${isToday ? '<span class="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider ml-1">Today</span>' : ''}
    `;
  },

  /**
   * Update Dashboard summary ring, macros, and calorie equation
   */
  renderDashboard() {
    const profile = Storage.getProfile();
    const totals = Storage.getDayTotals(this.currentDateKey);
    const macrosTarget = Calculator.calculateMacros(
      profile.targetCalories,
      profile.macroPreset,
      profile.customCarbsPct,
      profile.customProteinPct,
      profile.customFatPct
    );

    // Equation values: Target - Food + Burned = Remaining
    const targetEl = document.getElementById("dashTargetCalories");
    const foodEl = document.getElementById("dashFoodCalories");
    const burnedEl = document.getElementById("dashBurnedCalories");
    const remainingEl = document.getElementById("dashRemainingCalories");
    const statusPillEl = document.getElementById("dashStatusPill");

    if (targetEl) targetEl.textContent = profile.targetCalories.toLocaleString();
    if (foodEl) foodEl.textContent = totals.totalCalories.toLocaleString();
    if (burnedEl) burnedEl.textContent = totals.totalExerciseBurned.toLocaleString();
    if (remainingEl) remainingEl.textContent = Math.abs(totals.remainingCalories).toLocaleString();

    // Circular Progress Ring calculation
    const circle = document.getElementById("calorieProgressCircle");
    const ringLabel = document.getElementById("calorieRingLabel");
    if (circle && ringLabel) {
      const radius = 68;
      const circumference = 2 * Math.PI * radius;
      circle.style.strokeDasharray = `${circumference} ${circumference}`;

      // Net calories consumed against target
      const netCalories = totals.totalCalories - totals.totalExerciseBurned;
      const percent = Math.min(Math.max(netCalories / (profile.targetCalories || 2000), 0), 1);
      const offset = circumference - (percent * circumference);
      circle.style.strokeDashoffset = offset;

      if (totals.remainingCalories >= 0) {
        ringLabel.textContent = "Remaining";
        circle.classList.remove("stroke-rose-500");
        circle.classList.add("stroke-emerald-500");
      } else {
        ringLabel.textContent = "Over Budget";
        circle.classList.remove("stroke-emerald-500");
        circle.classList.add("stroke-rose-500");
      }
    }

    // Status pill
    if (statusPillEl) {
      if (totals.remainingCalories > 0) {
        statusPillEl.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
        statusPillEl.innerHTML = `<i class="fa-solid fa-arrow-down mr-1"></i> ${totals.remainingCalories} kcal deficit remaining`;
      } else if (totals.remainingCalories === 0) {
        statusPillEl.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30";
        statusPillEl.innerHTML = `<i class="fa-solid fa-check mr-1"></i> Exact Calorie Target Hit!`;
      } else {
        statusPillEl.className = "px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30";
        statusPillEl.innerHTML = `<i class="fa-solid fa-arrow-up mr-1"></i> ${Math.abs(totals.remainingCalories)} kcal above budget`;
      }
    }

    // Render Macro Progress Bars
    this.renderMacroBar("protein", totals.totalProtein, macrosTarget.protein.grams);
    this.renderMacroBar("carbs", totals.totalCarbs, macrosTarget.carbs.grams);
    this.renderMacroBar("fat", totals.totalFat, macrosTarget.fat.grams);

    // Update Macro Donut in Center
    AppCharts.renderMacroDonut(totals.totalProtein, totals.totalCarbs, totals.totalFat);

    // Render Meals
    this.renderMealSections();

    // Render Exercise Section
    this.renderExerciseSection();

    // Render Hydration
    this.renderHydrationWidget();

    // Render Fast Weight check-in
    this.renderQuickWeight();
  },

  /**
   * Render single macro progress bar
   */
  renderMacroBar(macro, current, target) {
    const currentEl = document.getElementById(`${macro}CurrentGrams`);
    const targetEl = document.getElementById(`${macro}TargetGrams`);
    const barEl = document.getElementById(`${macro}ProgressBar`);
    const pctEl = document.getElementById(`${macro}Percent`);

    if (currentEl) currentEl.textContent = `${current}g`;
    if (targetEl) targetEl.textContent = `/${target}g`;

    const pct = Math.round((current / (target || 1)) * 100);
    if (pctEl) pctEl.textContent = `${pct}%`;

    if (barEl) {
      const widthPct = Math.min(pct, 100);
      barEl.style.width = `${widthPct}%`;

      if (pct > 100) {
        barEl.classList.add("bg-rose-500");
      } else {
        barEl.classList.remove("bg-rose-500");
      }
    }
  },

  /**
   * Render Meals list with items and totals
   */
  renderMealSections() {
    const day = Storage.getDailyLog(this.currentDateKey);
    const meals = ["breakfast", "lunch", "dinner", "snacks"];

    meals.forEach(meal => {
      const container = document.getElementById(`${meal}ItemsList`);
      const totalCaloriesEl = document.getElementById(`${meal}TotalCalories`);
      const totalMacrosEl = document.getElementById(`${meal}TotalMacros`);

      if (!container) return;

      const items = day.meals[meal] || [];
      let mealCal = 0;
      let mealP = 0;
      let mealC = 0;
      let mealF = 0;

      if (items.length === 0) {
        container.innerHTML = `
          <div class="py-5 text-center text-slate-500 text-xs italic">
            No foods logged for ${meal} yet. Click <span class="text-indigo-400 font-medium">+ Add Food</span> to log.
          </div>
        `;
      } else {
        let html = "";
        items.forEach(item => {
          mealCal += item.calories;
          mealP += item.protein;
          mealC += item.carbs;
          mealF += item.fat;

          html += `
            <div class="group flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-all border border-slate-700/30">
              <div class="flex-1 min-w-0 pr-3">
                <div class="flex items-center gap-2">
                  <h5 class="text-sm font-semibold text-slate-200 truncate">${item.name}</h5>
                  <span class="text-[11px] text-slate-400 bg-slate-700/40 px-2 py-0.5 rounded-md">${item.serving}</span>
                </div>
                <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span class="text-emerald-400 font-medium">P: ${item.protein}g</span>
                  <span class="text-slate-600">•</span>
                  <span class="text-indigo-400 font-medium">C: ${item.carbs}g</span>
                  <span class="text-slate-600">•</span>
                  <span class="text-amber-400 font-medium">F: ${item.fat}g</span>
                  ${item.loggedAt ? `<span class="text-slate-500 ml-auto text-[10px]"><i class="fa-regular fa-clock mr-1"></i>${item.loggedAt}</span>` : ''}
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-bold text-slate-100">${item.calories} <span class="text-[10px] font-normal text-slate-400">kcal</span></span>
                <button 
                  onclick="UI.handleDeleteFood('${meal}', '${item.id}')"
                  class="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Remove food">
                  <i class="fa-regular fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>
          `;
        });
        container.innerHTML = html;
      }

      if (totalCaloriesEl) totalCaloriesEl.textContent = `${mealCal} kcal`;
      if (totalMacrosEl) totalMacrosEl.textContent = `P: ${mealP}g • C: ${mealC}g • F: ${mealF}g`;
    });
  },

  /**
   * Render Exercises burned list
   */
  renderExerciseSection() {
    const day = Storage.getDailyLog(this.currentDateKey);
    const container = document.getElementById("exerciseItemsList");
    const totalBurnedEl = document.getElementById("exerciseTotalBurned");

    if (!container) return;

    const exercises = day.exercises || [];
    let totalBurned = 0;

    if (exercises.length === 0) {
      container.innerHTML = `
        <div class="py-5 text-center text-slate-500 text-xs italic">
          No workouts logged today. Add an exercise to earn bonus active calories!
        </div>
      `;
    } else {
      let html = "";
      exercises.forEach(ex => {
        totalBurned += ex.caloriesBurned;
        html += `
          <div class="group flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-all border border-slate-700/30">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <i class="fa-solid ${ex.icon || 'fa-fire'} text-sm"></i>
              </div>
              <div>
                <h5 class="text-sm font-semibold text-slate-200">${ex.name}</h5>
                <p class="text-[11px] text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${ex.durationMinutes} mins • <span class="text-orange-400 font-medium">${ex.category}</span></p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-orange-400">+${ex.caloriesBurned} <span class="text-[10px] font-normal text-slate-400">kcal</span></span>
              <button 
                onclick="UI.handleDeleteExercise('${ex.id}')"
                class="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="Remove workout">
                <i class="fa-regular fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    }

    if (totalBurnedEl) totalBurnedEl.textContent = `+${totalBurned} kcal`;
  },

  /**
   * Render Hydration Tracker Widget
   */
  renderHydrationWidget() {
    const profile = Storage.getProfile();
    const day = Storage.getDailyLog(this.currentDateKey);
    const targetMl = profile.targetWaterMl || 2800;
    const currentMl = day.waterMl || 0;
    const pct = Math.min(Math.round((currentMl / targetMl) * 100), 150);

    const currentEl = document.getElementById("waterCurrentDisplay");
    const targetEl = document.getElementById("waterTargetDisplay");
    const pctEl = document.getElementById("waterPercentDisplay");
    const barEl = document.getElementById("waterProgressBar");
    const waveEl = document.getElementById("waterFillWave");

    if (currentEl) currentEl.textContent = `${(currentMl / 1000).toFixed(2)} L`;
    if (targetEl) targetEl.textContent = `/ ${(targetMl / 1000).toFixed(2)} L`;
    if (pctEl) pctEl.textContent = `${pct}%`;

    if (barEl) {
      barEl.style.width = `${Math.min(pct, 100)}%`;
    }
    if (waveEl) {
      waveEl.style.height = `${Math.min(pct, 100)}%`;
    }
  },

  /**
   * Render Quick Daily Weight check-in
   */
  renderQuickWeight() {
    const day = Storage.getDailyLog(this.currentDateKey);
    const profile = Storage.getProfile();
    const weightInput = document.getElementById("quickWeightInput");
    const currentDisplay = document.getElementById("quickWeightDisplay");

    if (currentDisplay) {
      const val = day.weightLogged || profile.weightKg;
      currentDisplay.textContent = `${val} kg`;
    }
    if (weightInput && day.weightLogged) {
      weightInput.value = day.weightLogged;
    }
  },

  /**
   * Delete food handler
   */
  handleDeleteFood(mealType, itemId) {
    Storage.removeFoodFromMeal(this.currentDateKey, mealType, itemId);
    this.renderDashboard();
    this.showToast("Food removed from log", "info");
  },

  /**
   * Delete exercise handler
   */
  handleDeleteExercise(exerciseId) {
    Storage.removeExercise(this.currentDateKey, exerciseId);
    this.renderDashboard();
    this.showToast("Workout removed from log", "info");
  },

  /**
   * Open Add Food Modal for specified meal
   */
  openAddFoodModal(mealType) {
    this.activeMealType = mealType;
    const modal = document.getElementById("addFoodModal");
    const title = document.getElementById("addFoodModalTitle");
    if (title) {
      title.textContent = `Add Food to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
    }

    // Reset search
    const searchInput = document.getElementById("foodSearchInput");
    if (searchInput) {
      searchInput.value = "";
      this.renderFoodSearchResults("");
    }

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  },

  closeAddFoodModal() {
    const modal = document.getElementById("addFoodModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  /**
   * Render Search Results in Food Modal
   */
  renderFoodSearchResults(query = "", category = "all") {
    const container = document.getElementById("foodSearchResults");
    if (!container) return;

    const results = Storage.searchFoods(query, category);

    if (results.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-500 text-sm">
          <i class="fa-solid fa-utensils text-2xl mb-2 opacity-50 block"></i>
          No foods matched your search. Switch to the <b>"Create Custom Food"</b> tab to add it!
        </div>
      `;
      return;
    }

    let html = "";
    results.forEach(food => {
      html += `
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 transition-all">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-sm text-slate-100">${food.name}</span>
              <span class="text-[10px] bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full">${food.category || 'General'}</span>
            </div>
            <div class="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>${food.serving}</span>
              <span>•</span>
              <span class="text-emerald-400">P: ${food.protein}g</span>
              <span class="text-indigo-400">C: ${food.carbs}g</span>
              <span class="text-amber-400">F: ${food.fat}g</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold text-slate-100">${food.calories} <span class="text-xs font-normal text-slate-400">kcal</span></span>
            <button 
              onclick="UI.handleAddFoodFromLibrary('${food.id}')"
              class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1">
              <i class="fa-solid fa-plus text-[10px]"></i> Add
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  /**
   * Handle food addition from library
   */
  handleAddFoodFromLibrary(foodId) {
    const all = [...CONFIG.FOOD_DATABASE, ...Storage.STATE.customFoods];
    const food = all.find(f => f.id === foodId);
    if (!food) return;

    Storage.addFoodToMeal(this.currentDateKey, this.activeMealType, food);
    this.closeAddFoodModal();
    this.renderDashboard();
    this.showToast(`Added ${food.name} to ${this.activeMealType}!`);

    // Check if target reached
    const totals = Storage.getDayTotals(this.currentDateKey);
    if (Math.abs(totals.remainingCalories) <= 60) {
      this.triggerCelebration();
    }
  },

  /**
   * Open Add Exercise Modal
   */
  openAddExerciseModal() {
    const modal = document.getElementById("addExerciseModal");
    const select = document.getElementById("exercisePresetSelect");
    const userWeight = Storage.getProfile().weightKg;

    if (select) {
      select.innerHTML = CONFIG.EXERCISE_DATABASE.map(ex => `
        <option value="${ex.id}" data-met="${ex.met}">${ex.name} (${ex.category})</option>
      `).join("");
      this.updateCalculatedBurnedPreview();
    }

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  },

  closeAddExerciseModal() {
    const modal = document.getElementById("addExerciseModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  /**
   * Update calculated preview calories burned in exercise modal
   */
  updateCalculatedBurnedPreview() {
    const select = document.getElementById("exercisePresetSelect");
    const durationInput = document.getElementById("exerciseDurationInput");
    const previewEl = document.getElementById("exerciseCaloriesPreview");
    if (!select || !durationInput || !previewEl) return;

    const opt = select.options[select.selectedIndex];
    const met = Number(opt?.getAttribute("data-met")) || 7.0;
    const duration = Number(durationInput.value) || 30;
    const weight = Storage.getProfile().weightKg;

    const burned = Calculator.calculateExerciseCalories(met, weight, duration);
    previewEl.textContent = `${burned} kcal`;
  },

  /**
   * Profile & Metabolic Calculator Tab rendering
   */
  renderProfileCalculator() {
    const profile = Storage.getProfile();

    // Populate inputs
    const genderSelect = document.getElementById("calcGender");
    const ageInput = document.getElementById("calcAge");
    const heightInput = document.getElementById("calcHeight");
    const weightInput = document.getElementById("calcWeight");
    const targetWeightInput = document.getElementById("calcTargetWeight");
    const activitySelect = document.getElementById("calcActivity");
    const goalSelect = document.getElementById("calcGoal");
    const macroPresetSelect = document.getElementById("calcMacroPreset");

    if (genderSelect) genderSelect.value = profile.gender;
    if (ageInput) ageInput.value = profile.age;
    if (heightInput) heightInput.value = profile.heightCm;
    if (weightInput) weightInput.value = profile.weightKg;
    if (targetWeightInput) targetWeightInput.value = profile.targetWeightKg;
    if (activitySelect) activitySelect.value = profile.activityLevel;
    if (goalSelect) goalSelect.value = profile.goal;
    if (macroPresetSelect) macroPresetSelect.value = profile.macroPreset;

    this.updateCalculatorLivePreview();
  },

  /**
   * Real-time calculation preview when user changes inputs in Profile tab
   */
  updateCalculatorLivePreview() {
    const gender = document.getElementById("calcGender")?.value || "male";
    const age = Number(document.getElementById("calcAge")?.value) || 25;
    const heightCm = Number(document.getElementById("calcHeight")?.value) || 175;
    const weightKg = Number(document.getElementById("calcWeight")?.value) || 75;
    const targetWeightKg = Number(document.getElementById("calcTargetWeight")?.value) || 70;
    const activityLevel = document.getElementById("calcActivity")?.value || "moderate";
    const goal = document.getElementById("calcGoal")?.value || "lose_steady";
    const macroPreset = document.getElementById("calcMacroPreset")?.value || "high_protein";

    // Calculations
    const bmr = Calculator.calculateBMR(gender, weightKg, heightCm, age);
    const tdee = Calculator.calculateTDEE(bmr, activityLevel);
    const targetCalories = Calculator.calculateTargetCalories(tdee, goal, gender);
    const bmi = Calculator.calculateBMI(weightKg, heightCm);
    const bmiCategory = Calculator.getBMICategory(bmi);
    const idealWeight = Calculator.getIdealWeightRange(heightCm);
    const waterTarget = Calculator.calculateWaterTarget(weightKg, activityLevel);
    const macros = Calculator.calculateMacros(targetCalories, macroPreset);

    // Update live DOM displays
    const bmrDisplay = document.getElementById("calcBmrDisplay");
    const tdeeDisplay = document.getElementById("calcTdeeDisplay");
    const targetCalDisplay = document.getElementById("calcTargetCalDisplay");
    const bmiDisplay = document.getElementById("calcBmiDisplay");
    const bmiBadge = document.getElementById("calcBmiBadge");
    const bmiDesc = document.getElementById("calcBmiDescription");
    const idealWeightDisplay = document.getElementById("calcIdealWeightDisplay");
    const waterDisplay = document.getElementById("calcWaterDisplay");

    if (bmrDisplay) bmrDisplay.textContent = `${bmr.toLocaleString()} kcal/day`;
    if (tdeeDisplay) tdeeDisplay.textContent = `${tdee.toLocaleString()} kcal/day`;
    if (targetCalDisplay) targetCalDisplay.textContent = `${targetCalories.toLocaleString()} kcal/day`;
    if (bmiDisplay) bmiDisplay.textContent = bmi.toFixed(1);

    if (bmiBadge) {
      bmiBadge.className = `px-3 py-1 rounded-full text-xs font-bold border ${bmiCategory.bg} ${bmiCategory.color}`;
      bmiBadge.textContent = bmiCategory.label;
    }
    if (bmiDesc) {
      bmiDesc.textContent = bmiCategory.description;
    }
    if (idealWeightDisplay) {
      idealWeightDisplay.textContent = `${idealWeight.minKg} - ${idealWeight.maxKg} kg`;
    }
    if (waterDisplay) {
      waterDisplay.textContent = `${(waterTarget / 1000).toFixed(2)} Liters (${waterTarget} ml)`;
    }

    // Macro targets preview
    const proteinPreview = document.getElementById("calcProteinPreview");
    const carbsPreview = document.getElementById("calcCarbsPreview");
    const fatPreview = document.getElementById("calcFatPreview");

    if (proteinPreview) proteinPreview.textContent = `${macros.protein.grams}g (${macros.protein.calories} kcal)`;
    if (carbsPreview) carbsPreview.textContent = `${macros.carbs.grams}g (${macros.carbs.calories} kcal)`;
    if (fatPreview) fatPreview.textContent = `${macros.fat.grams}g (${macros.fat.calories} kcal)`;

    // Custom macros row visibility
    const customRow = document.getElementById("customMacrosRow");
    if (customRow) {
      if (macroPreset === "custom") {
        customRow.classList.remove("hidden");
      } else {
        customRow.classList.add("hidden");
      }
    }
  },

  /**
   * Render Food Database Explorer tab
   */
  renderFoodLibraryTab(search = "", category = "all") {
    const container = document.getElementById("libraryFoodList");
    if (!container) return;

    const foods = Storage.searchFoods(search, category);

    if (foods.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500">
          <i class="fa-solid fa-magnifying-glass text-3xl mb-3 opacity-40 block"></i>
          No foods found matching your query.
        </div>
      `;
      return;
    }

    let html = "";
    foods.forEach(food => {
      html += `
        <div class="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600 transition-all flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-bold text-slate-100 text-sm leading-snug">${food.name}</h4>
              <span class="text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-full shrink-0">${food.category || 'General'}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">Serving size: <span class="text-slate-300 font-medium">${food.serving}</span></p>
            
            <div class="mt-4 grid grid-cols-4 gap-2 text-center">
              <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-[10px] uppercase text-slate-500 font-semibold block">Calories</span>
                <span class="text-sm font-extrabold text-blue-400">${food.calories}</span>
              </div>
              <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-[10px] uppercase text-slate-500 font-semibold block">Protein</span>
                <span class="text-sm font-extrabold text-emerald-400">${food.protein}g</span>
              </div>
              <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-[10px] uppercase text-slate-500 font-semibold block">Carbs</span>
                <span class="text-sm font-extrabold text-indigo-400">${food.carbs}g</span>
              </div>
              <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-[10px] uppercase text-slate-500 font-semibold block">Fat</span>
                <span class="text-sm font-extrabold text-amber-400">${food.fat}g</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-700/30 flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Log to today's log:</span>
            <div class="flex gap-1">
              <button onclick="UI.quickLogFoodToMeal('${food.id}', 'breakfast')" class="px-2 py-1 text-[10px] font-semibold rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors">B</button>
              <button onclick="UI.quickLogFoodToMeal('${food.id}', 'lunch')" class="px-2 py-1 text-[10px] font-semibold rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors">L</button>
              <button onclick="UI.quickLogFoodToMeal('${food.id}', 'dinner')" class="px-2 py-1 text-[10px] font-semibold rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors">D</button>
              <button onclick="UI.quickLogFoodToMeal('${food.id}', 'snacks')" class="px-2 py-1 text-[10px] font-semibold rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors">S</button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  quickLogFoodToMeal(foodId, mealType) {
    const all = [...CONFIG.FOOD_DATABASE, ...Storage.STATE.customFoods];
    const food = all.find(f => f.id === foodId);
    if (!food) return;

    Storage.addFoodToMeal(this.currentDateKey, mealType, food);
    this.renderDashboard();
    this.showToast(`Logged ${food.name} to ${mealType}!`);
  },

  /**
   * Render Analytics & Trends Tab
   */
  renderAnalyticsTab() {
    const profile = Storage.getProfile();
    const weeklySummary = Storage.getPastDaysSummary(7);
    const weightHistory = Storage.STATE.weightHistory || [];

    // Summary stats
    let totalConsumedWeek = 0;
    let totalBurnedWeek = 0;
    weeklySummary.forEach(day => {
      totalConsumedWeek += day.consumed;
      totalBurnedWeek += day.burned;
    });

    const avgDailyCal = Math.round(totalConsumedWeek / weeklySummary.length);
    const avgBurnedCal = Math.round(totalBurnedWeek / weeklySummary.length);

    const avgCalEl = document.getElementById("analyticsAvgCal");
    const avgBurnedEl = document.getElementById("analyticsAvgBurned");
    const adherenceEl = document.getElementById("analyticsAdherenceRate");

    if (avgCalEl) avgCalEl.textContent = `${avgDailyCal} kcal`;
    if (avgBurnedEl) avgBurnedEl.textContent = `${avgBurnedCal} kcal`;

    if (adherenceEl) {
      // Days within +/- 15% of target
      const onTargetDays = weeklySummary.filter(d => {
        const diff = Math.abs(d.consumed - d.target);
        return diff <= (d.target * 0.15);
      }).length;
      const rate = Math.round((onTargetDays / weeklySummary.length) * 100);
      adherenceEl.textContent = `${rate}%`;
    }

    // Render Charts
    AppCharts.renderWeeklyCalorieChart(weeklySummary);
    AppCharts.renderWeightTrendChart(weightHistory, profile.targetWeightKg);
  }
};

if (typeof window !== "undefined") {
  window.UI = UI;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = UI;
}
