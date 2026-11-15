# 📊 ASU Crowd Tracker — MATLAB Matrix Simulation

Mathematical simulation, statistical matrix calculations, and 2D/3D heatmap visualization script for the **ASU Sun Devil Crowd Tracker** project by **Team Delta Y**.

---

## 📁 Files
- **[`simulate_asu_crowd.m`](./simulate_asu_crowd.m)**: Main MATLAB script containing matrix modeling, statistical analysis, and plot generation.
- **`asu_crowd_matrix.csv`**: Matrix exported by the script with 5 venue rows and 15 hourly columns.
- **`asu_crowd_matrix.json`**: Structured JSON data exported for web & API integration.

---

## 🧮 Mathematical Model

### 1. Stochastic Gaussian Mixture Modeling
Each venue's crowd distribution across time $t \in [8, 22]$ is modeled using a sum of Gaussian kernel functions representing rush hours:

$$D_i(t) = B_i + \sum_{k=1}^{K} A_{i,k} \cdot \exp\left(-\frac{(t - \mu_{i,k})^2}{2\sigma_{i,k}^2}\right) + \epsilon(t)$$

Where:
- $B_i$: Baseline minimum ambient occupancy rate (%)
- $A_{i,k}$: Peak surge amplitude for peak $k$
- $\mu_{i,k}$: Center time of rush hour (e.g., $12.5$ for 12:30 PM lunch, $18.0$ for 6:00 PM gym rush)
- $\sigma_{i,k}$: Spread/duration of the surge period
- $\epsilon(t) \sim \mathcal{U}(-4, 4)$: Stochastic Monte Carlo noise factor

### 2. Headcount Matrix
The discrete physical headcount for venue $i$ at hour $j$ is computed via Hadamard element-wise matrix multiplication:

$$\mathbf{H}_{i,j} = \left\lfloor \frac{\mathbf{O}_{i,j}}{100} \cdot C_i \right\rceil$$

Where $\mathbf{O}$ is the $5 \times 15$ occupancy percentage matrix and $C_i$ is the maximum capacity vector.

---

## 🚀 How to Run

### Method 1: MATLAB Online (Free for ASU Students)
1. Go to **[matlab.mathworks.com](https://matlab.mathworks.com)** and log in with your **ASURITE** `@asu.edu` email.
2. Upload `simulate_asu_crowd.m` into your MATLAB Drive.
3. Open the file and click **Run** (or type `simulate_asu_crowd` in the Command Window).

### Method 2: MATLAB Desktop
1. Open MATLAB.
2. In the Current Folder browser, navigate to:
   `/Users/anuragsingh/Downloads/ASU Heatmap/matlab`
3. In the Command Window, run:
   ```matlab
   simulate_asu_crowd
   ```

---

## 📊 Outputs Generated
1. **Interactive 2D Heatmap (`heatmap`)**: Uses ASU Maroon (`#8C1D40`) and Sun Devil Gold (`#FFC627`) colormap.
2. **3D Mesh Surface Plot (`surf`)**: Shows time vs. venue vs. crowd density topography.
3. **Statistical Summary Table**: Mean occupancy, standard deviation, and peak hour indices.
4. **Data Exports**: Auto-saves `asu_crowd_matrix.csv` and `asu_crowd_matrix.json`.
