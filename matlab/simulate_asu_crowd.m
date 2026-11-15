%% ASU Sun Devil Crowd Density Matrix Simulation & Heatmap Analysis
% Team: Delta Y
% Project: ASU Sun Devil Crowd Tracker
% Description: Simulates hourly crowd densities across 5 ASU Tempe venues,
% performs matrix operations, statistical analyses, and generates 2D/3D visualizations.

clear; clc; close all;

%% 1. Definition of Venues, Capacities, and Operational Hours
venues = {
    'SDFC Fitness', ...
    'Hayden Library', ...
    'Memorial Union', ...
    'Tooker Dining', ...
    'Barrett Dining'
};

capacities = [800; 1500; 2000; 550; 600]; % [1x5 vector]
hours = 8:22; % 8:00 AM to 10:00 PM (15 time intervals)
numVenues = length(venues);
numHours = length(hours);

fprintf('========================================================\n');
fprintf('  ASU CROWD DENSITY MATRIX SIMULATION - TEAM DELTA Y    \n');
fprintf('========================================================\n\n');

%% 2. Stochastic Matrix Generation using Gaussian Mixture Models
% OccupancyMatrix size: [numVenues x numHours] (5 x 15 matrix)
OccupancyMatrix = zeros(numVenues, numHours);

rng(42); % Seed for reproducible results

for hIdx = 1:numHours
    t = hours(hIdx);
    
    % SDFC: Dual-peak Gaussian (Morning 9 AM, Evening 6 PM)
    sdfc_val = 20 + 35*exp(-((t-9)^2)/(2*2.0^2)) + 55*exp(-((t-18)^2)/(2*2.2^2));
    
    % Hayden Library: Midday study plateau (11 AM - 5 PM)
    hayden_val = 15 + 75*exp(-((t-14)^2)/(2*3.5^2));
    
    % Memorial Union: Sharp lunch spike at 12:30 PM & afternoon lounge
    mu_val = 15 + 80*exp(-((t-12.5)^2)/(2*1.8^2)) + 30*exp(-((t-17)^2)/(2*2.5^2));
    
    % Tooker Dining: Lunch spike (12 PM) and Dinner spike (6 PM)
    tooker_val = 10 + 65*exp(-((t-12)^2)/(2*1.4^2)) + 75*exp(-((t-18.5)^2)/(2*1.5^2));
    
    % Barrett Dining: Lunch spike (12:30 PM) and Gourmet Dinner spike (6:30 PM)
    barrett_val = 10 + 60*exp(-((t-12.5)^2)/(2*1.3^2)) + 80*exp(-((t-18.5)^2)/(2*1.6^2));
    
    % Add stochastic random jitter (-4% to +4%)
    noise = (rand(5, 1) - 0.5) * 8;
    
    raw_col = [sdfc_val; hayden_val; mu_val; tooker_val; barrett_val] + noise;
    
    % Clamp between 5% and 98%
    OccupancyMatrix(:, hIdx) = max(5, min(98, round(raw_col)));
end

%% 3. Headcount Matrix Calculation
% Headcount = (Occupancy% / 100) .* Capacity
HeadcountMatrix = round((OccupancyMatrix ./ 100) .* capacities);

%% 4. Statistical Matrix Calculations
meanOccupancy = mean(OccupancyMatrix, 2);    % Row-wise mean
stdOccupancy  = std(OccupancyMatrix, 0, 2);   % Row-wise standard deviation
[maxOcc, maxIdx] = max(OccupancyMatrix, [], 2); % Peak occupancy & hour index

fprintf('%-20s %-12s %-12s %-15s %-12s\n', 'Venue', 'Mean Occ (%)', 'Std Dev', 'Peak Hour', 'Max Occ (%)');
fprintf('-------------------------------------------------------------------------\n');
for i = 1:numVenues
    peakHourStr = sprintf('%d:00', hours(maxIdx(i)));
    if hours(maxIdx(i)) < 12
        peakHourStr = [peakHourStr, ' AM'];
    elseif hours(maxIdx(i)) == 12
        peakHourStr = [peakHourStr, ' PM'];
    else
        peakHourStr = sprintf('%d:00 PM', hours(maxIdx(i)) - 12);
    end
    
    fprintf('%-20s %-12.1f %-12.1f %-15s %-12d\n', ...
        venues{i}, meanOccupancy(i), stdOccupancy(i), peakHourStr, maxOcc(i));
end
fprintf('-------------------------------------------------------------------------\n\n');

% Cross-correlation / Covariance matrix between venues
CorrelationMatrix = corrcoef(OccupancyMatrix');

%% 5. Custom ASU Color Palette for Plots
% ASU Maroon (#8C1D40) to Sun Devil Gold (#FFC627) colormap
asuColors = [
    0.95 0.95 0.98; % Light Slate
    0.10 0.70 0.50; % Emerald (<40%)
    1.00 0.78 0.15; % Sun Devil Gold (40-60%)
    0.42 0.13 0.66; % Purple (60-80%)
    0.55 0.11 0.25  % ASU Maroon (>80%)
];
asuCmap = interp1(linspace(0, 1, size(asuColors, 1)), asuColors, linspace(0, 1, 64));

%% 6. Visualization 1: 2D Interactive Heatmap
figure('Name', 'ASU Tempe Venue Crowd Density Heatmap', 'Position', [100, 100, 900, 500]);
hourLabels = arrayfun(@(h) sprintf('%d %s', mod(h-1, 12)+1, ternary(h<12, 'AM', 'PM')), hours, 'UniformOutput', false);

hHeat = heatmap(hourLabels, venues, OccupancyMatrix);
hHeat.Title = 'ASU Tempe Campus Hourly Crowd Density (%) — Team Delta Y';
hHeat.XLabel = 'Time of Day';
hHeat.YLabel = 'Campus Venue';
hHeat.Colormap = asuCmap;
hHeat.ColorLimits = [0 100];

%% 7. Visualization 2: 3D Surface / Mesh Plot
figure('Name', '3D Surface of Campus Crowd Dynamics', 'Position', [150, 150, 900, 550]);
[X, Y] = meshgrid(hours, 1:numVenues);

surf(X, Y, OccupancyMatrix, 'FaceAlpha', 0.88, 'EdgeColor', [0.2 0.2 0.2]);
colormap(asuCmap);
colorbar;
caxis([0 100]);

set(gca, 'YTick', 1:numVenues, 'YTickLabel', venues);
set(gca, 'XTick', hours, 'XTickLabel', hourLabels);
xlabel('Hour of Day');
ylabel('Venue');
zlabel('Occupancy Rate (%)');
title('3D Surface: Temporal Crowd Dynamics Across ASU Tempe Campus');
view(-35, 45);
grid on;

%% 8. Export Matrix to CSV and JSON
% Export CSV
csvTable = array2table(OccupancyMatrix, 'RowNames', venues, 'VariableNames', matlab.lang.makeValidName(hourLabels));
writetable(csvTable, 'asu_crowd_matrix.csv', 'WriteRowNames', true);
fprintf('✓ Exported Matrix to asu_crowd_matrix.csv\n');

% Export JSON for Next.js and FastAPI
jsonStruct = struct();
for i = 1:numVenues
    vName = matlab.lang.makeValidName(venues{i});
    jsonStruct.(vName).meanOccupancy = meanOccupancy(i);
    jsonStruct.(vName).peakOccupancy = maxOcc(i);
    jsonStruct.(vName).capacity = capacities(i);
    jsonStruct.(vName).hourlyCurve = OccupancyMatrix(i, :);
end
jsonStr = jsonencode(jsonStruct);
fid = fopen('asu_crowd_matrix.json', 'w');
if fid > 0
    fprintf(fid, '%s', jsonStr);
    fclose(fid);
    fprintf('✓ Exported JSON Data to asu_crowd_matrix.json\n\n');
end

fprintf('Simulation and Analysis Complete!\n');

%% Helper Function
function result = ternary(condition, valTrue, valFalse)
    if condition
        result = valTrue;
    else
        result = valFalse;
    end
end
