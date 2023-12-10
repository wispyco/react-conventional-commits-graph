import { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

const emojiMap = {
  bugs: "🐛",
  features: "✨",
  chores: "🧹", // Example emoji for chores
  fixes: "🔧", // Example emoji for fixes
  // others: "📦", // Example emoji for others
  docs: "📝",
  refactor: "♻️",
};

const emojiPlugin = {
  id: "emojiPlugin",
  afterDraw: (chart) => {
    const ctx = chart.ctx;

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((bar, index) => {
        const emoji = emojiMap[chart.data.labels[index]];
        const { x, y, base, width, height } = bar;
        const dataValue = dataset.data[index]; // The number of emojis we want to show

        // Calculate the number of rows and columns of emojis based on the data value
        const numRows = Math.ceil(Math.sqrt(dataValue));
        const numCols = Math.ceil(dataValue / numRows);

        // Calculate the size of each emoji to fit the bar's dimensions
        const emojiWidth = width / numCols;
        const emojiHeight = height / numRows;
        const emojiSize = Math.min(emojiWidth, emojiHeight); // Use the smallest to fit both dimensions

        ctx.font = `${emojiSize}px Arial`;

        // Draw the emojis in a grid pattern
        // for (let row = 0; row < numRows; row++) {
        //   for (let col = 0; col < numCols; col++) {
        //     if (row * numCols + col < dataValue) { // Ensure we don't draw more emojis than the data value
        //       const emojiX = x - width / 2 + col * emojiWidth;
        //       const emojiY = base - (numRows - row) * emojiHeight; // Start from the bottom of the bar
        //       ctx.fillText(emoji, emojiX, emojiY);
        //     }
        //   }
        // }
        // ... rest of your plugin code

        // Draw the emojis in a grid pattern
        for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < numCols; col++) {
            if (row * numCols + col < dataValue) {
              // Ensure we don't draw more emojis than the data value
              const emojiX = x - width / 2 + col * emojiWidth;
              const emojiY = base - emojiHeight - row * emojiHeight; // Adjusted to start from the bottom
              // Save the context and rotate the canvas around the emoji's center
              ctx.save();
              ctx.translate(emojiX + emojiSize / 2, emojiY + emojiSize / 2);
              ctx.rotate(Math.PI); // Rotate 180 degrees
              ctx.fillText(emoji, -emojiSize / 2, -emojiSize / 2);
              ctx.restore(); // Restore the context to the original state for the next emoji
            }
          }
        }

        // ... rest of your plugin code
      });
    });
  },
};

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);
ChartJS.register(emojiPlugin); // Register the custom plugin

const CommitChart = () => {
  const [commitData, setCommitData] = useState({
    labels: [],
    datasets: [],
  });

  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/commitMessages.json");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const commitMessages = await response.json();

        // Process your commit messages to get the data for the chart
        // Assuming you process the data to the format Chart.js expects
        // Example: { labels: ['Label1', 'Label2'], datasets: [{ data: [1, 2] }] }
        const processedData = processData(commitMessages);

        // If the chart already exists, update it
        if (chartRef.current) {
          chartRef.current.data = processedData;
          chartRef.current.update();
        } else {
          setCommitData(processedData); // Set data for initial chart rendering
        }
      } catch (error) {
        console.error("Failed to fetch commit messages:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once after the first render

  const options = {
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        // Additional options for the Y-axis can be set here
      },
    },
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
      // ... other plugin configurations
      emojiPlugin: {}, // This is just to enable the plugin
    },
  };

  return (
    <div>
      <h2>Commit Chart</h2>
      <Bar ref={chartRef} data={commitData} options={options} />
    </div>
  );
};

export default CommitChart;

// Helper function to process the raw data
function processData(commitMessages) {
  const counts = {
    bugs: 0,
    features: 0,
    chores: 0,
    fixes: 0,
    // others: 0,
    docs: 0,
    refactor:0,
  };

  commitMessages.forEach((msg) => {
    if (msg.includes("bug:") || msg.includes("🐛")) {
      counts.bugs++;
    } else if (msg.includes("feat:") || msg.includes("✨")) {
      counts.features++;
    } else if (msg.includes("chore:")) {
      counts.chores++;
    } else if (msg.includes("fix:")) {
      counts.fixes++;
    } else if (msg.includes("docs:")) {
      counts.docs++;
    } else if (msg.includes("refactor:")) {
      counts.refactor++;
    }
    //  else {
    // counts.others++; // Count all other commits as 'others'
    // }
  });

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "Number of Commits",
        data: Object.values(counts),
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)", // color for bugs
          "rgba(54, 162, 235, 0.2)", // color for features
          "rgba(255, 206, 86, 0.2)", // color for chores
          "rgba(75, 192, 192, 0.2)", // color for fixes
          "rgba(153, 102, 255, 0.2)", // color for others
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
}
