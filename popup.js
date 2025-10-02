import { getDataFromStorage } from "./storage.js";

// Arrays for chart
const labels = [];
const values = [];

// Fetch stored timeSpent
const data = await getDataFromStorage("timeSpent");

if (data) {
  Object.entries(data).forEach(([domain, time]) => {
    labels.push(domain);

    // Convert milliseconds to total minutes
    const totalMinutes = Math.floor(time / 1000 / 60);

    // Or if you want total hours instead: const totalHours = time / 1000 / 3600;

    values.push(totalMinutes); // Add number to values array
  });
}

// Draw chart
const ctx = document.getElementById("chart").getContext("2d");
new Chart(ctx, {
  type: "pie",
  data: {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#8BC34A",
          "#FF9800",
        ],
      },
    ],
  },
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed; // value from your values array
            return `${context.label}: ${value} minutes`;
          },
        },
      },
    },
  },
});
