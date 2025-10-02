import { useState, useEffect } from "react";
import { Container, CssBaseline, Typography } from "@mui/material";
import axios from "axios";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      // get best submission from each group
      try {
        const response = await axios.get("/api/leaderboard");
        setLeaderboardData(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
      
    };

    fetchLeaderboardData();
  }, []);

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Typography variant="h4" gutterBottom>
        Leaderboard
      </Typography>
      {
        leaderboardData.length === 0 ? (
          <Typography variant="body1" gutterBottom>
            No data available.
          </Typography>
        ) : null
      }
      <ul>
        {leaderboardData.map((entry) => (
          <li key={entry.id}>
            {entry.name}: {entry.score}
          </li>
        ))}
      </ul>
    </Container>
  );
};

export default Leaderboard;
