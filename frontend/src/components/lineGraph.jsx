import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);
import { Box, Typography } from "@mui/material";

const LineGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return <Typography>No data available for graph.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, marginTop: 2 }}>
      <Line
        data={{
          labels: data.map((_, index) => index + 1),
          datasets: [
            {
              label: "Training Progress",
              data: data,
              fill: false,
              borderColor: "rgba(75,192,192,1)",
              tension: 0.1,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true, position: "top" },
          },
          scales: {
            x: { title: { display: true, text: "Episode" } },
            y: { title: { display: true, text: "Value" } },
          },
        }}
      />
    </Box>
  );
};

export default LineGraph;
