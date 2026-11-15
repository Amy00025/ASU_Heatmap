#!/usr/bin/env python3
"""
ASU Sun Devil Crowd Density Matrix Simulation & Heatmap
Team: Delta Y
Description: Python companion to simulate_asu_crowd.m.
Runs the exact same Gaussian stochastic matrix mathematical model,
calculates statistical metrics, exports CSV/JSON matrices, and saves high-res plots.
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors

# 1. Definitions
VENUES = [
    "SDFC Fitness",
    "Hayden Library",
    "Memorial Union",
    "Tooker Dining",
    "Barrett Dining"
]
CAPACITIES = np.array([800, 1500, 2000, 550, 600]) # 5 venues
HOURS = np.arange(8, 23) # 8 AM to 10 PM (15 intervals)
NUM_VENUES = len(VENUES)
NUM_HOURS = len(HOURS)

# 2. Stochastic Matrix Generation using Gaussian Mixture Models
np.random.seed(42) # Reproducible
occupancy_matrix = np.zeros((NUM_VENUES, NUM_HOURS))

for h_idx, t in enumerate(HOURS):
    # SDFC: Dual-peak Gaussian (Morning 9 AM, Evening 6 PM)
    sdfc = 20 + 35 * np.exp(-((t - 9)**2) / (2 * 2.0**2)) + 55 * np.exp(-((t - 18)**2) / (2 * 2.2**2))
    
    # Hayden Library: Midday study plateau (11 AM - 5 PM)
    hayden = 15 + 75 * np.exp(-((t - 14)**2) / (2 * 3.5**2))
    
    # Memorial Union: Sharp lunch spike at 12:30 PM & afternoon lounge
    mu = 15 + 80 * np.exp(-((t - 12.5)**2) / (2 * 1.8**2)) + 30 * np.exp(-((t - 17)**2) / (2 * 2.5**2))
    
    # Tooker Dining: Lunch spike (12 PM) and Dinner spike (6 PM)
    tooker = 10 + 65 * np.exp(-((t - 12)**2) / (2 * 1.4**2)) + 75 * np.exp(-((t - 18.5)**2) / (2 * 1.5**2))
    
    # Barrett Dining: Lunch spike (12:30 PM) and Gourmet Dinner spike (6:30 PM)
    barrett = 10 + 60 * np.exp(-((t - 12.5)**2) / (2 * 1.3**2)) + 80 * np.exp(-((t - 18.5)**2) / (2 * 1.6**2))
    
    noise = (np.random.rand(5) - 0.5) * 8
    raw_col = np.array([sdfc, hayden, mu, tooker, barrett]) + noise
    occupancy_matrix[:, h_idx] = np.clip(np.round(raw_col), 5, 98)

# 3. Headcount Matrix
headcount_matrix = np.round((occupancy_matrix / 100.0) * CAPACITIES[:, np.newaxis]).astype(int)

# 4. Statistical Analysis
mean_occ = np.mean(occupancy_matrix, axis=1)
std_occ  = np.std(occupancy_matrix, axis=1)
max_occ  = np.max(occupancy_matrix, axis=1)
max_idx  = np.argmax(occupancy_matrix, axis=1)

hour_labels = [f"{(h-1)%12 + 1} {'AM' if h < 12 else 'PM'}" for h in HOURS]

print("=" * 75)
print("  ASU CROWD DENSITY MATRIX SIMULATION — TEAM DELTA Y")
print("=" * 75)
print(f"{'Venue':<22} {'Mean Occ (%)':<14} {'Std Dev':<12} {'Peak Hour':<14} {'Max Occ (%)':<12}")
print("-" * 75)

for i in range(NUM_VENUES):
    print(f"{VENUES[i]:<22} {mean_occ[i]:<14.1f} {std_occ[i]:<12.1f} {hour_labels[max_idx[i]]:<14} {int(max_occ[i]):<12}")
print("-" * 75)

# 5. Export to CSV & JSON
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, "asu_crowd_matrix.csv")
json_path = os.path.join(script_dir, "asu_crowd_matrix.json")

df = pd.DataFrame(occupancy_matrix.astype(int), index=VENUES, columns=hour_labels)
df.to_csv(csv_path)
print(f"\n✓ Exported CSV matrix: {csv_path}")

json_data = {}
for i, venue in enumerate(VENUES):
    json_data[venue.replace(" ", "_")] = {
        "capacity": int(CAPACITIES[i]),
        "meanOccupancy": round(float(mean_occ[i]), 1),
        "peakOccupancy": int(max_occ[i]),
        "peakHour": hour_labels[max_idx[i]],
        "hourlyCurve": [int(x) for x in occupancy_matrix[i]]
    }

with open(json_path, "w") as f:
    json.dump(json_data, f, indent=2)
print(f"✓ Exported JSON dataset: {json_path}")

# 6. Generate Plot with ASU Maroon & Gold Colormap
asu_colors = ["#0F172A", "#10B981", "#FFC627", "#7C3AED", "#8C1D40"]
cmap = mcolors.LinearSegmentedColormap.from_list("asu_cmap", asu_colors, N=256)

plt.figure(figsize=(12, 6), dpi=150)
im = plt.imshow(occupancy_matrix, cmap=cmap, aspect="auto", vmin=0, vmax=100)

plt.xticks(np.arange(NUM_HOURS), hour_labels, rotation=45, ha="right", fontsize=9, fontweight="bold")
plt.yticks(np.arange(NUM_VENUES), VENUES, fontsize=10, fontweight="bold")
plt.title("ASU Tempe Campus Hourly Crowd Density Matrix (%) — Team Delta Y", fontsize=13, fontweight="bold", pad=15)
plt.xlabel("Hour of Day", fontweight="bold", labelpad=8)
plt.ylabel("Campus Venue", fontweight="bold", labelpad=8)

# Overlay numeric percentage labels inside each cell
for i in range(NUM_VENUES):
    for j in range(NUM_HOURS):
        val = int(occupancy_matrix[i, j])
        color = "white" if (val < 20 or val > 75) else "black"
        plt.text(j, i, f"{val}%", ha="center", va="center", color=color, fontsize=8, fontweight="bold")

cbar = plt.colorbar(im, pad=0.02)
cbar.set_label("Occupancy Rate (%)", fontweight="bold")

plot_path = os.path.join(script_dir, "asu_crowd_heatmap.png")
plt.tight_layout()
plt.savefig(plot_path)
plt.close()
print(f"✓ Generated Heatmap Graphic: {plot_path}\n")
print("Matrix simulation completed successfully!")
