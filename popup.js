import { getDataFromStorage } from "./storage.js";

// Arrays for chart
const labels = [];
const values = [];

// Fetch stored timeSpent
const data = await getDataFromStorage("timeSpent");

if (data) {
  // Sort entries by time (descending)
  const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  // Set a threshold: 1% of total time or minimum 5 minutes
  const totalTime = sortedEntries.reduce((sum, [_, time]) => sum + time, 0);
  const threshold = Math.max(totalTime * 0.01, 3 * 60 * 1000); // 1% or 5 minutes

  let othersTime = 0;

  sortedEntries.forEach(([domain, time]) => {
    const totalMinutes = Math.floor(time / 1000 / 60);

    if (time >= threshold) {
      labels.push(domain);
      values.push(totalMinutes);
    } else {
      othersTime += totalMinutes;
    }
  });

  // Add "Others" category if there are small values
  if (othersTime > 0) {
    labels.push("Others");
    values.push(othersTime);
  }
}

const backgroundColor = labels.map(
  (_, i) => `hsl(${(i * 40) % 360}, 70%, 60%)`
);

// Draw chart
const ctx = document.getElementById("chart").getContext("2d");

new Chart(ctx, {
  type: "pie",
  data: {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColor,
      },
    ],
  },
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed;
            const hours = Math.floor(value / 60);
            const minutes = value % 60;
            return `${context.label}: ${hours}h ${minutes}m`;
          },
        },
      },
      legend: {
        position: "right", // Move legend to the side for better visibility
      },
    },
  },
});
