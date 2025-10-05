import { useParams } from "react-router-dom";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Stack,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  SCHEDULER_BASE_URL,
  JobErrorMap,
  JobStatusMap,
  ROLE_ADMIN,
  ROLE_LECTURER,
} from "../constants";
import catalogueService from "../lib/api/catalogueService";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";
import LineGraph from "../components/lineGraph";

const RESULTS_BASE_URL = "http://localhost:3003";

const TrainingResults = () => {
  const { id, task_id } = useParams();
  const user = useSelector(selectUser);
  const [userGroupId, setUserGroupId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState({});

  const fetchResult = async jobId => {
    try {
      const response = await axios.get(`${RESULTS_BASE_URL}/training-results/${jobId}/`);
      if (!response.data) {
        setResults(prev => ({ ...prev, [jobId]: { noResultError: "No result data available" } }));
      } else {
        setResults(prev => ({ ...prev, [jobId]: response.data }));
      }
    } catch (error) {
      console.error("Error fetching training results:", error);
      setResults(prev => ({ ...prev, [jobId]: { noResultError: "Failed to load result" } }));
    }
  };

  const renderResult = jobId => {
    const result = results[jobId];
    if (!result) {
      return (
        <Button size="small" onClick={() => fetchResult(jobId)} variant="outlined">
          Load Result
        </Button>
      );
    }

    if (result.noResultError) {
      return <Typography color="error">{result.noResultError}</Typography>;
    }

    const detailArr = result.details.detail || [];
    const last10 = detailArr.slice(-10);
    const avgLast10 =
      last10.length > 0
        ? (last10.reduce((sum, val) => sum + val, 0) / last10.length).toFixed(2)
        : "N/A";

    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Result:
        </Typography>

        <Stack spacing={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={result.status}
              color={result.status === "COMPLETED" ? "success" : "error"}
              size="small"
            />
          </Box>

          {/* Display result details*/}
          <Box sx={{ border: 1, borderColor: "grey.300", borderRadius: 1, p: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Details:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="caption" fontWeight="bold">
                Evaluator: {result.details.name}
              </Typography>
              <Typography variant="body2">Avg Score (Last 10 episodes): {avgLast10}</Typography>
              {/* Plot result graph */}
              <LineGraph data={result.details.detail} />
              {result.error && result.error !== "None" && (
                <Typography variant="body2" color="error">
                  Error: {result.error}, Details: {result.details.error}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>
    );
  };

  // fetch userGroupId
  useEffect(() => {
    const fetchUserGroupId = async () => {
      try {
        const response = await catalogueService.get(`/groups/user/${user.id}/course/${id}/`);
        setUserGroupId(response.data.groupId);
      } catch (error) {
        console.error("Error fetching user group ID:", error);
      }
    };

    fetchUserGroupId();
  }, [id, user?.id]);

  // fetch jobs for the task and user group
  useEffect(() => {
    if (!userGroupId) {
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await axios.get(
          `${SCHEDULER_BASE_URL}/api/training_jobs/?task_id=${task_id}&group_id=${userGroupId}`,
        );
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, [userGroupId, task_id]);

  const loading = !userGroupId || jobs.length === 0;

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Typography variant="h4" gutterBottom>
        Training Results
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        jobs.map(job => (
          <Accordion key={job.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Training Job at {new Date(job.created_at).toLocaleString()}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Status: {JobStatusMap[job.status] || job.status}
                </Typography>
                {renderResult(job.id)}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
};

export default TrainingResults;
