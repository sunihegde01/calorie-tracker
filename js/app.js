// NutriPulse - Main Application Controller & Event Listeners

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize State and UI
  Storage.init();
  UI.init();

  // Apply saved theme
  const savedTheme = Storage.STATE.theme || "dark";
  applyTheme(savedTheme);

  // Initial renders
  UI.renderDateNavigation();
  UI.renderDashboard();
  UI.renderProfileCalculator();
  UI.renderFoodLibraryTab();

  // 2. Tab Navigation
  const tabButtons = document.querySelectorAll("[data-tab-target]");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab-target");
      switchTab(targetId);
    });
  });

  function switchTab(targetId) {
    // Update active tab buttons
    document.querySelectorAll("[data-tab-target]").forEach(b => {
      if (b.getAttribute("data-tab-target") === targetId) {
        b.classList.add("bg-indigo-600", "text-white", "shadow-lg", "shadow-indigo-600/30");
        b.classList.remove("text-slate-400", "hover:text-slate-200", "hover:bg-slate-800/60");
      } else {
        b.classList.remove("bg-indigo-600", "text-white", "shadow-lg", "shadow-indigo-600/30");
        b.classList.add("text-slate-400", "hover:text-slate-200", "hover:bg-slate-800/60");
      }
    });

    // Toggle tab panels
    document.querySelectorAll(".tab-content-panel").forEach(panel => {
      panel.classList.add("hidden");
    });
    const activePanel = document.getElementById(targetId);
    if (activePanel) {
      activePanel.classList.remove("hidden");
    }

    // Refresh tab-specific components
    if (targetId === "dashboardTab") {
      UI.renderDashboard();
    } else if (targetId === "profileTab") {
      UI.renderProfileCalculator();
    } else if (targetId === "libraryTab") {
      UI.renderFoodLibraryTab();
    } else if (targetId === "analyticsTab") {
      UI.renderAnalyticsTab();
    }
  }

  // 3. Date Navigation Listeners
  const prevDateBtn = document.getElementById("prevDateBtn");
  const nextDateBtn = document.getElementById("nextDateBtn");
  const todayDateBtn = document.getElementById("todayDateBtn");
  const datePickerInput = document.getElementById("datePickerInput");

  if (prevDateBtn) {
    prevDateBtn.addEventListener("click", () => {
      shiftDate(-1);
    });
  }

  if (nextDateBtn) {
    nextDateBtn.addEventListener("click", () => {
      shiftDate(1);
    });
  }

  if (todayDateBtn) {
    todayDateBtn.addEventListener("click", () => {
      UI.currentDateKey = Storage.formatDateKey(new Date());
      UI.renderDateNavigation();
      UI.renderDashboard();
    });
  }

  if (datePickerInput) {
    datePickerInput.addEventListener("change", (e) => {
      if (e.target.value) {
        UI.currentDateKey = e.target.value;
        UI.renderDateNavigation();
        UI.renderDashboard();
      }
    });
  }

  function shiftDate(deltaDays) {
    const cur = new Date(UI.currentDateKey + "T00:00:00");
    cur.setDate(cur.getDate() + deltaDays);
    UI.currentDateKey = Storage.formatDateKey(cur);
    UI.renderDateNavigation();
    UI.renderDashboard();
  }

  // 4. Hydration Quick Actions
  document.getElementById("addWater250")?.addEventListener("click", () => {
    Storage.updateWater(UI.currentDateKey, 250);
    UI.renderHydrationWidget();
    UI.showToast("Logged +250ml water (1 glass)", "info");
  });

  document.getElementById("addWater500")?.addEventListener("click", () => {
    Storage.updateWater(UI.currentDateKey, 500);
    UI.renderHydrationWidget();
    UI.showToast("Logged +500ml water (1 bottle)", "info");
  });

  document.getElementById("subtractWater250")?.addEventListener("click", () => {
    Storage.updateWater(UI.currentDateKey, -250);
    UI.renderHydrationWidget();
  });

  // 5. Quick Daily Weight Check-in
  document.getElementById("saveQuickWeightBtn")?.addEventListener("click", () => {
    const input = document.getElementById("quickWeightInput");
    const val = parseFloat(input?.value);
    if (!val || val <= 20 || val > 350) {
      UI.showToast("Please enter a valid weight between 20kg and 350kg", "error");
      return;
    }
    Storage.logWeight(UI.currentDateKey, val);
    UI.renderQuickWeight();
    UI.showToast(`Logged weight: ${val} kg!`, "success");
  });

  // 6. Food Modal Search & Category Filter
  const foodSearchInput = document.getElementById("foodSearchInput");
  const foodCategoryFilter = document.getElementById("foodCategoryFilter");

  if (foodSearchInput) {
    foodSearchInput.addEventListener("input", (e) => {
      const cat = foodCategoryFilter?.value || "all";
      UI.renderFoodSearchResults(e.target.value, cat);
    });
  }

  if (foodCategoryFilter) {
    foodCategoryFilter.addEventListener("change", (e) => {
      const q = foodSearchInput?.value || "";
      UI.renderFoodSearchResults(q, e.target.value);
    });
  }

  // Modal food sub-tabs (Search vs Custom Food form)
  const modalTabSearch = document.getElementById("modalTabSearch");
  const modalTabCustom = document.getElementById("modalTabCustom");
  const modalPanelSearch = document.getElementById("modalPanelSearch");
  const modalPanelCustom = document.getElementById("modalPanelCustom");

  if (modalTabSearch && modalTabCustom) {
    modalTabSearch.addEventListener("click", () => {
      modalTabSearch.classList.add("bg-slate-700", "text-white");
      modalTabSearch.classList.remove("text-slate-400");
      modalTabCustom.classList.remove("bg-slate-700", "text-white");
      modalTabCustom.classList.add("text-slate-400");
      modalPanelSearch?.classList.remove("hidden");
      modalPanelCustom?.classList.add("hidden");
    });

    modalTabCustom.addEventListener("click", () => {
      modalTabCustom.classList.add("bg-slate-700", "text-white");
      modalTabCustom.classList.remove("text-slate-400");
      modalTabSearch.classList.remove("bg-slate-700", "text-white");
      modalTabSearch.classList.add("text-slate-400");
      modalPanelCustom?.classList.remove("hidden");
      modalPanelSearch?.classList.add("hidden");
    });
  }

  // Custom food form submission
  document.getElementById("customFoodForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("customFoodName")?.value.trim();
    const serving = document.getElementById("customFoodServing")?.value.trim() || "1 serving";
    const calories = Number(document.getElementById("customFoodCalories")?.value);
    const protein = Number(document.getElementById("customFoodProtein")?.value || 0);
    const carbs = Number(document.getElementById("customFoodCarbs")?.value || 0);
    const fat = Number(document.getElementById("customFoodFat")?.value || 0);

    if (!name || isNaN(calories) || calories < 0) {
      UI.showToast("Please provide a valid food name and calories", "error");
      return;
    }

    const newFood = Storage.addCustomFood({
      name,
      serving,
      calories,
      protein,
      carbs,
      fat,
      category: "Custom"
    });

    // Also add to current active meal
    Storage.addFoodToMeal(UI.currentDateKey, UI.activeMealType, newFood);
    UI.closeAddFoodModal();
    UI.renderDashboard();
    UI.showToast(`Saved and logged ${name}!`, "success");

    // Reset form
    e.target.reset();
  });

  // 7. Exercise Modal Handlers
  const exercisePresetSelect = document.getElementById("exercisePresetSelect");
  const exerciseDurationInput = document.getElementById("exerciseDurationInput");

  exercisePresetSelect?.addEventListener("change", () => UI.updateCalculatedBurnedPreview());
  exerciseDurationInput?.addEventListener("input", () => UI.updateCalculatedBurnedPreview());

  document.getElementById("addExerciseForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const select = document.getElementById("exercisePresetSelect");
    const opt = select.options[select.selectedIndex];
    const exerciseName = opt.text.split("(")[0].trim();
    const met = Number(opt.getAttribute("data-met")) || 6.0;
    const duration = Number(document.getElementById("exerciseDurationInput")?.value) || 30;
    const weight = Storage.getProfile().weightKg;

    const burned = Calculator.calculateExerciseCalories(met, weight, duration);

    Storage.addExercise(UI.currentDateKey, {
      name: exerciseName,
      durationMinutes: duration,
      caloriesBurned: burned,
      category: "Workout",
      icon: "fa-dumbbell"
    });

    UI.closeAddExerciseModal();
    UI.renderDashboard();
    UI.showToast(`Logged ${duration} min workout (+${burned} kcal burned)!`, "success");
  });

  // 8. Profile & Calculator Live Listeners and Save
  const calcInputs = [
    "calcGender", "calcAge", "calcHeight", "calcWeight", "calcTargetWeight",
    "calcActivity", "calcGoal", "calcMacroPreset", "calcCustomCarbs",
    "calcCustomProtein", "calcCustomFat"
  ];

  calcInputs.forEach(id => {
    document.getElementById(id)?.addEventListener("input", () => {
      UI.updateCalculatorLivePreview();
    });
  });

  document.getElementById("profileCalculatorForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const gender = document.getElementById("calcGender")?.value || "male";
    const age = Number(document.getElementById("calcAge")?.value) || 25;
    const heightCm = Number(document.getElementById("calcHeight")?.value) || 175;
    const weightKg = Number(document.getElementById("calcWeight")?.value) || 75;
    const targetWeightKg = Number(document.getElementById("calcTargetWeight")?.value) || 70;
    const activityLevel = document.getElementById("calcActivity")?.value || "moderate";
    const goal = document.getElementById("calcGoal")?.value || "lose_steady";
    const macroPreset = document.getElementById("calcMacroPreset")?.value || "high_protein";
    const customCarbsPct = Number(document.getElementById("calcCustomCarbs")?.value) || 40;
    const customProteinPct = Number(document.getElementById("calcCustomProtein")?.value) || 30;
    const customFatPct = Number(document.getElementById("calcCustomFat")?.value) || 30;

    // Run core calculations
    const bmr = Calculator.calculateBMR(gender, weightKg, heightCm, age);
    const tdee = Calculator.calculateTDEE(bmr, activityLevel);
    const targetCalories = Calculator.calculateTargetCalories(tdee, goal, gender);
    const targetWaterMl = Calculator.calculateWaterTarget(weightKg, activityLevel);

    Storage.updateProfile({
      gender,
      age,
      heightCm,
      weightKg,
      targetWeightKg,
      activityLevel,
      goal,
      macroPreset,
      customCarbsPct,
      customProteinPct,
      customFatPct,
      bmr,
      tdee,
      targetCalories,
      targetWaterMl
    });

    // Also update weight in history for today if not already set
    Storage.logWeight(UI.currentDateKey, weightKg);

    UI.renderDashboard();
    UI.showToast("Personal profile & daily calorie targets updated!", "success");
    UI.triggerCelebration();

    // Switch smoothly to Dashboard so user sees immediate results
    switchTab("dashboardTab");
  });

  // 9. Food Library Explorer Search
  const librarySearchInput = document.getElementById("librarySearchInput");
  const libraryCategoryFilter = document.getElementById("libraryCategoryFilter");

  librarySearchInput?.addEventListener("input", (e) => {
    const cat = libraryCategoryFilter?.value || "all";
    UI.renderFoodLibraryTab(e.target.value, cat);
  });

  libraryCategoryFilter?.addEventListener("change", (e) => {
    const q = librarySearchInput?.value || "";
    UI.renderFoodLibraryTab(q, e.target.value);
  });

  // 10. Data Backup / Restore & Reset
  document.getElementById("exportDataBtn")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(Storage.exportData());
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nutripulse_backup_${Storage.formatDateKey(new Date())}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    UI.showToast("Backup exported successfully!", "success");
  });

  document.getElementById("importDataInput")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = Storage.importData(event.target.result);
      if (success) {
        UI.renderDashboard();
        UI.renderProfileCalculator();
        UI.showToast("Data restored successfully!", "success");
      } else {
        UI.showToast("Failed to restore: invalid backup file format.", "error");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("resetDataBtn")?.addEventListener("click", () => {
    if (confirm("Reset everything back to initial demo data? Your custom logs will be overwritten.")) {
      Storage.resetAll();
      UI.renderDashboard();
      UI.renderProfileCalculator();
      UI.renderFoodLibraryTab();
      UI.showToast("Loaded fresh sample data!", "info");
    }
  });

  // 11. Theme Switcher (Dark / Light)
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isCurrentlyDark = document.documentElement.classList.contains("dark");
      const nextTheme = isCurrentlyDark ? "light" : "dark";
      applyTheme(nextTheme);
      Storage.STATE.theme = nextTheme;
      Storage.save();

      // Refresh charts to match colors
      UI.renderDashboard();
      if (!document.getElementById("analyticsTab").classList.contains("hidden")) {
        UI.renderAnalyticsTab();
      }
    });
  }

  function applyTheme(theme) {
    const icon = document.getElementById("themeToggleIcon");
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      if (icon) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
      }
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      if (icon) {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
      }
    }
  }

  // 12. Unit System Toggler (Metric vs Imperial in Calculator)
  const unitSystemToggle = document.getElementById("unitSystemToggle");
  if (unitSystemToggle) {
    unitSystemToggle.addEventListener("change", (e) => {
      const isImperial = e.target.value === "imperial";
      const heightLabel = document.getElementById("heightInputLabel");
      const weightLabel = document.getElementById("weightInputLabel");
      const targetWeightLabel = document.getElementById("targetWeightInputLabel");
      const heightInput = document.getElementById("calcHeight");
      const weightInput = document.getElementById("calcWeight");
      const targetWeightInput = document.getElementById("calcTargetWeight");

      if (isImperial) {
        if (heightLabel) heightLabel.textContent = "Height (inches)";
        if (weightLabel) weightLabel.textContent = "Weight (lbs)";
        if (targetWeightLabel) targetWeightLabel.textContent = "Target Weight (lbs)";

        // Convert current display values
        if (weightInput) weightInput.value = Calculator.kgToLbs(Number(weightInput.value) || 75);
        if (targetWeightInput) targetWeightInput.value = Calculator.kgToLbs(Number(targetWeightInput.value) || 70);
        if (heightInput) heightInput.value = Math.round((Number(heightInput.value) || 175) / 2.54);
      } else {
        if (heightLabel) heightLabel.textContent = "Height (cm)";
        if (weightLabel) weightLabel.textContent = "Weight (kg)";
        if (targetWeightLabel) targetWeightLabel.textContent = "Target Weight (kg)";

        // Convert current display values back to metric
        if (weightInput) weightInput.value = Calculator.lbsToKg(Number(weightInput.value) || 165);
        if (targetWeightInput) targetWeightInput.value = Calculator.lbsToKg(Number(targetWeightInput.value) || 154);
        if (heightInput) heightInput.value = Math.round((Number(heightInput.value) || 69) * 2.54);
      }
      UI.updateCalculatorLivePreview();
    });
  }
});
