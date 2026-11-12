# 🥗 NutriPulse — Smart Calorie & Metabolic Health Tracker

> A modern, responsive web application designed for comprehensive nutrition and calorie tracking based on personal biometric metrics (**Weight, Height, Age, Biological Sex, and Activity Base**).

![NutriPulse App](https://img.shields.io/badge/Status-Complete-emerald?style=for-the-badge)
![Tech](https://img.shields.io/badge/HTML5-TailwindCSS-Chart.js-indigo?style=for-the-badge)

---

## 🌟 Key Features

### 1. 🧮 Precision Metabolic Calculator (Weight, Height & Activity)
* **BMR (Basal Metabolic Rate)**: Uses the clinically validated **Mifflin-St Jeor equation** to calculate calories burned at rest.
* **TDEE (Total Daily Energy Expenditure)**: Dynamic multipliers based on 5 standardized activity tiers (Sedentary 1.20×, Light 1.375×, Moderate 1.55×, Very Active 1.725×, Extremely Active 1.90×).
* **Goal-Adjusted Calorie Targets**:
  * Fast Weight Loss (-750 kcal/day)
  * Steady Weight Loss (-500 kcal/day, recommended sustainable pace)
  * Mild Fat Loss (-250 kcal/day)
  * Weight Maintenance (0 kcal adjustment)
  * Lean Muscle Gain (+250 kcal/day)
  * Bulking (+500 kcal/day)
* **BMI Diagnostic & Ideal Weight Range**: Real-time BMI category classification with safe, height-matched normal weight ranges.
* **Target Hydration Engine**: Personalized daily water recommendations computed using body weight + activity bonus.
* **Smart Macro Splits**: High Protein (35C/40P/25F), Balanced (45C/25P/30F), Low Carb (20C/40P/40F), Ketogenic (5C/25P/70F), or fully customized percentage splits.

### 2. 📊 Interactive Daily Tracker Dashboard
* **Dynamic Calorie Balance Ring**: Real-time visualization of:
  $$\text{Remaining Calories} = \text{Budget} - \text{Food Consumed} + \text{Exercise Burned}$$
* **Live Macronutrient Progress**: Real-time grams and percentages for Protein, Carbohydrates, and Fats with an interactive doughnut visualization.
* **Meal Logging (Breakfast, Lunch, Dinner, Snacks)**:
  * Over 40 pre-loaded whole foods with verified caloric and macronutrient densities.
  * Instant search and food filtering.
  * Custom food creator with custom portion sizing.
  * Delete and portion adjust capabilities.
* **Active Exercise Logger**:
  * Calculate active calories burned using standardized **Metabolic Equivalent of Task (MET)** formulas calibrated to user's body weight:
    $$\text{Calories Burned} = \text{MET} \times \text{Weight (kg)} \times \left(\frac{\text{Duration (min)}}{60}\right)$$
  * Pre-loaded activities: Running, Walking, Cycling, HIIT, Strength Training, Swimming, Sports, Yoga, and Combat sports.
* **Daily Hydration Tracker**:
  * Visual animated water bottle fill.
  * Quick log buttons (+250ml glass, +500ml bottle, undo).
* **Quick Daily Weight Check-in**: Record morning weight to track trend line over time.

### 3. 📈 Analytics, Adherence & Trends
* **7-Day Caloric Adherence Chart**: Combined bar and line chart showing Food Consumed vs Active Burn vs Daily Goal Budget.
* **Weight Loss Trend Line**: Smoothed weight tracking curve mapped against your target goal line.
* **KPI Adherence Score**: Calculates percentage of days within goal tolerance.

### 4. 🗄️ Persistence & Offline Capability
* Auto-saves all profiles, meals, workouts, and weight logs in browser `localStorage`.
* Full **JSON Export / Backup** and **JSON Restore** capability.
* One-click **Demo Data** generator to test all features with pre-populated history.
* **Dark / Light mode** toggle with persistent preference.
* **Metric (kg, cm)** and **Imperial (lbs, inches)** unit toggle.

---

## 🚀 How to Run

### Method 1: Direct File Launch (No setup required!)
Simply double-click `index.html` or open it with any web browser (Chrome, Edge, Firefox, Safari):
```bash
# In Windows PowerShell:
Start-Process .\index.html
```

### Method 2: Local HTTP Server (Optional)
If you prefer running via a local web server:
```bash
# Using Node / npx:
npx serve .

# Or using Python:
python -m http.server 8000
```
Then visit `http://localhost:3000` (or `http://localhost:8000`).

---

## 📁 Project Architecture

```
PORTFOLIO thursday/
├── index.html          # Main HTML structure with Tailwind CSS, Lucide/FA icons & modals
├── css/
│   └── styles.css      # Custom animations, progress rings, glassmorphism, themes
├── js/
│   ├── config.js       # Food & Exercise databases, activity factors, default presets
│   ├── calculator.js   # Mifflin-St Jeor BMR, TDEE, BMI, Macros, MET burn engine
│   ├── storage.js      # LocalStorage persistence, demo data, import/export
│   ├── charts.js       # Chart.js instances (Donut, Weekly bars, Weight trend line)
│   ├── ui.js           # DOM manipulation, modals, hydration widget, toast notifications
│   └── app.js          # App bootstrap, event listeners, tab navigation, unit switching
├── package.json        # Project metadata and quick-start scripts
└── README.md           # Documentation & clinical formulas
```
