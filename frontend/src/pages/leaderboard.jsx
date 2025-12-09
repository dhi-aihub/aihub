import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  CssBaseline,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";
import catalogueService from "../lib/api/catalogueService";

const Leaderboard = () => {
  const { id, task_id } = useParams();
  const [groups, setGroups] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await catalogueService.get(`/submissions/selections/tasks/${task_id}/`);
        setLeaderboardData(response.data.data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [task_id]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await catalogueService.get(`/tasks/${task_id}/groups`);
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, [task_id]);

  function getGroupName(groupId) {
    const group = groups.find(g => String(g.id) === String(groupId));
    return group ? group.name : "Unknown Group";
  }

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Typography variant="h4" gutterBottom>
        Leaderboard
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : leaderboardData.length === 0 ? (
        <Typography variant="body1" gutterBottom>
          No data available.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Group Name</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Score</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboardData.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>{getGroupName(entry.groupId)}</TableCell>
                  <TableCell align="right">{entry.result.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Leaderboard;
