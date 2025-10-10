import { useParams } from "react-router-dom";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { selectUser } from "../redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { isLoggedIn } from "../lib/auth";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

import {
  SCHEDULER_BASE_URL,
  JobErrorMap,
  JobStatusMap,
  ROLE_ADMIN,
  ROLE_LECTURER,
} from "../constants";
import catalogueService from "../lib/api/catalogueService";

// import ReactJson from "react-json-view";
import { cleanAuthStorage } from "../lib/auth";
import { CheckCircle, Star } from "@mui/icons-material";
import Button from "@mui/material/Button";

const RESULTS_BASE_URL = "http://localhost:3003";

const markForGrading = sid => {
  axios({
    method: "get",
    url: SCHEDULER_BASE_URL + `/api/v1/submissions/${sid}/mark_for_grading/`,
    headers: {
      authorization: "Bearer " + sessionStorage.getItem("token"),
    },
  })
    .then(() => {
      // console.log(resp);
      window.location.reload();
    })
    .catch(e => {
      console.log(e);
    });
};

const Submissions = () => {
  const { id, task_id } = useParams();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobStatus, setJobStatus] = useState();
  const [openJobStatus, setOpenJobStatus] = useState(false);
  const [course, setCourse] = useState(null);
  const [groupedSubmissions, setGroupedSubmissions] = useState({});
  const [submissionResults, setSubmissionResults] = useState({});
  const [loadingResults, setLoadingResults] = useState({});
  const [studentSelections, setStudentSelections] = useState({});
  const [loadingSelections, setLoadingSelections] = useState({});

  const isAdmin =
    course && (course.participation === ROLE_ADMIN || course.participation === ROLE_LECTURER);
  const [userGroupId, setUserGroupId] = useState(null);

  // Function to fetch student selection for a specific group and task
  const fetchStudentSelection = async (taskId, groupId) => {
    const selectionKey = `${taskId}_${groupId}`;

    if (studentSelections[selectionKey] || loadingSelections[selectionKey]) {
      return;
    }

    setLoadingSelections(prev => ({ ...prev, [selectionKey]: true }));

    try {
      const response = await axios({
        method: "get",
        url: `${RESULTS_BASE_URL}/selections/task/${taskId}/group/${groupId}`,
        headers: {
          authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      });

      console.log("Fetched student selection:", response.data);

      setStudentSelections(prev => ({
        ...prev,
        [selectionKey]: response.data,
      }));
    } catch (error) {
      console.error(
        `Failed to fetch student selection for task ${taskId}, group ${groupId}:`,
        error,
      );
      setStudentSelections(prev => ({
        ...prev,
        [selectionKey]: { error: "Failed to fetch student selection" },
      }));
    } finally {
      setLoadingSelections(prev => ({ ...prev, [selectionKey]: false }));
    }
  };

  // Function to fetch result for a specific submission
  const fetchSubmissionResult = async submissionId => {
    if (submissionResults[submissionId] || loadingResults[submissionId]) {
      return;
    }

    setLoadingResults(prev => ({ ...prev, [submissionId]: true }));

    try {
      const response = await axios({
        method: "get",
        url: `${RESULTS_BASE_URL}/results/results?submissionId=${submissionId}`,
        headers: {
          authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      });

      setSubmissionResults(prev => ({
        ...prev,
        [submissionId]: response.data,
      }));
    } catch (error) {
      console.error(`Failed to fetch result for submission ${submissionId}:`, error);
      setSubmissionResults(prev => ({
        ...prev,
        [submissionId]: { error: "Failed to fetch result" },
      }));
    } finally {
      setLoadingResults(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  // Component to render student selection
  const renderStudentSelection = (taskId, groupId) => {
    const selectionKey = `${taskId}_${groupId}`;
    const selection = studentSelections[selectionKey];
    const isLoading = loadingSelections[selectionKey];

    if (isLoading) {
      return <CircularProgress size={20} />;
    }

    if (!selection) {
      return (
        <Button
          size="small"
          onClick={() => fetchStudentSelection(taskId, groupId)}
          variant="outlined"
          startIcon={<Star />}
        >
          Load Selected Submission
        </Button>
      );
    }

    if (selection.error) {
      return <Typography color="error">{selection.error}</Typography>;
    }

    if (!selection) {
      return (
        <Typography color="text.secondary">No submission selected for grading yet.</Typography>
      );
    }

    return (
      <Box
        sx={{
          border: 1,
          borderColor: "primary.main",
          borderRadius: 1,
          p: 2,
          bgcolor: "primary.50",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Star color="primary" />
          <Typography variant="subtitle2" fontWeight="bold" color="primary">
            Selected for Grading
          </Typography>
        </Stack>
        <Typography variant="body2">Result ID: {selection.id}</Typography>
        <Typography variant="caption" color="text.secondary">
          Updated: {new Date(selection.updatedAt).toLocaleString()}
        </Typography>
      </Box>
    );
  };

  // Component to render submission results
  const renderSubmissionResult = submissionId => {
    const result = submissionResults[submissionId];
    const isLoading = loadingResults[submissionId];

    if (isLoading) {
      return <CircularProgress size={20} />;
    }

    if (!result) {
      return (
        <Button size="small" onClick={() => fetchSubmissionResult(submissionId)} variant="outlined">
          Load Result
        </Button>
      );
    }

    if (result.error) {
      return <Typography color="error">{result.error}</Typography>;
    }

    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Result:
        </Typography>
        {result.data && result.data.length > 0 && result.data[0] ? (
          <Stack spacing={2}>
            {/* Status and Score */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={result.data[0].status}
                color={result.data[0].status === "PASSED" ? "success" : "error"}
                size="small"
              />
              <Typography variant="body2" fontWeight="bold">
                Score: {result.data[0].score}
              </Typography>
            </Stack>

            {/* Metrics */}
            {result.data[0].metrics && (
              <Box sx={{ border: 1, borderColor: "grey.300", borderRadius: 1, p: 1 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Metrics:
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="caption" fontWeight="bold">
                    Suite: {result.data[0].metrics.suite_id}
                  </Typography>
                  {result.data[0].metrics.results &&
                    result.data[0].metrics.results.map((testResult, index) => (
                      <Box key={index} sx={{ ml: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight="bold">
                          Test Case {testResult.case_id}: {testResult.result.name}
                        </Typography>
                        <Stack spacing={0.5} sx={{ ml: 1 }}>
                          <Typography variant="caption">
                            Value: {testResult.result.value}
                          </Typography>
                          {testResult.result.detail && (
                            <Stack spacing={0.25}>
                              <Typography variant="caption" color="text.secondary">
                                Details:
                              </Typography>
                              {Object.entries(testResult.result.detail).map(([key, value]) => (
                                <Typography
                                  key={key}
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ ml: 1 }}
                                >
                                  {key.replace(/_/g, " ")}: {value}
                                </Typography>
                              ))}
                            </Stack>
                          )}
                          {testResult.result.error && testResult.result.error !== "None" && (
                            <Typography variant="caption" color="error">
                              Error: {testResult.result.error}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              </Box>
            )}

            {/* Additional Info */}
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(result.data[0].createdAt).toLocaleString()}
              </Typography>
              {result.data[0].updatedAt !== result.data[0].createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Updated: {new Date(result.data[0].updatedAt).toLocaleString()}
                </Typography>
              )}
            </Stack>

            {/* Error display if present */}
            {result.data[0].error && (
              <Typography variant="caption" color="error" display="block">
                Error: {result.data[0].error}
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No results available for this submission.
          </Typography>
        )}
      </Box>
    );
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseResponse = await catalogueService.get(`/courses/${id}/`);
        setCourse(courseResponse.data["data"]);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };

    fetchCourse();
  }, [id]);

  // Fetch and set userGroupId
  useEffect(() => {
    const fetchUserGroupId = async () => {
      if (!course || isAdmin) {
        return;
      }

      try {
        const courseResponse = await catalogueService.get(
          `/groups/user/${user.id}/task/${task_id}/`,
        );
        console.log("Fetched user group ID:", courseResponse.data.groupId);
        setUserGroupId(courseResponse.data.groupId);
      } catch (error) {
        console.error("Failed to fetch user group ID:", error);
      }
    };

    fetchUserGroupId();
  }, [id, course, isAdmin, user?.id]);

  // For admins and lecturers to get all submissions for the task
  // For students to get submissions for their group only
  useEffect(() => {
    if (!course) {
      return;
    }

    // For students, wait until we have the group ID
    if (!isAdmin && !userGroupId) {
      return;
    }

    const fetchSubmissions = async () => {
      try {
        let endpoint;

        if (isAdmin) {
          endpoint = SCHEDULER_BASE_URL + `/api/jobs/?task_id=${task_id}`;
        } else {
          endpoint = SCHEDULER_BASE_URL + `/api/jobs/?task_id=${task_id}&group_id=${userGroupId}`;
        }

        const resp = await axios({
          method: "get",
          url: endpoint,
          headers: {
            authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        });

        const data = resp.data;
        setSubmissions(data);

        // If admin/lecturer, group submissions by group_id
        if (isAdmin) {
          const grouped = data.reduce((acc, submission) => {
            const groupId = submission.group_id;
            if (!acc[groupId]) {
              acc[groupId] = [];
            }
            acc[groupId].push(submission);
            return acc;
          }, {});
          //console.log(grouped);
          setGroupedSubmissions(grouped);
        }

        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [id, isLoggedIn, task_id, course, isAdmin, userGroupId]);

  // Auto-fetch student selection for students once userGroupId is available
  useEffect(() => {
    if (!isAdmin && userGroupId && task_id) {
      fetchStudentSelection(task_id, userGroupId);
    }
  }, [userGroupId, task_id, isAdmin]);

  if (!isLoggedIn) {
    cleanAuthStorage();
    dispatch(logout());
    navigate("/signin");
    return null;
  }

  // Render student view
  const renderStudentView = () => (
    <>
      {userGroupId && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Submission for Grading
          </Typography>
          {renderStudentSelection(task_id, userGroupId)}
        </Box>
      )}

      {submissions.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          No submissions to view.
        </Typography>
      ) : (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            All Submissions
          </Typography>
          {submissions.map((submission, index) => (
            <Accordion key={`submission_${index}`}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack>
                  <Stack direction={"row"}>
                    <Typography variant={"h6"}>
                      Attempt at {new Date(submission["created_at"]).toLocaleString()}
                    </Typography>
                    {submission["marked_for_grading"] ? (
                      <CheckCircle sx={{ color: "success.light", marginLeft: 0.5 }} />
                    ) : null}
                  </Stack>
                  {submission["point"] ? (
                    <div>
                      <Typography variant={"button"}>Score: </Typography>
                      <Typography variant={"button"}>{submission["point"]}</Typography>
                    </div>
                  ) : null}
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ mb: 2 }}>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Status: {JobStatusMap[submission.status] || submission.status}
                  </Typography>
                  {renderSubmissionResult(submission.submission_id)}
                </Stack>
              </AccordionDetails>
              <AccordionActions sx={{ justifyContent: "left" }}>
                <Button onClick={() => markForGrading(submission["submission_id"])}>
                  Mark For Grading
                </Button>
              </AccordionActions>
            </Accordion>
          ))}
        </>
      )}
    </>
  );

  // Render admin/lecturer view (grouped by student/group)
  const renderAdminView = () => (
    <>
      {Object.entries(groupedSubmissions).map(([groupId, groupSubmissions]) => (
        <Accordion key={`group_${groupId}`}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack>
              <Typography variant={"h5"}>Group/Student ID: {groupId}</Typography>
              <Typography variant={"body2"} color="text.secondary">
                {groupSubmissions.length} submission(s)
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {/* Student Selection for this group */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Selected Submission for Grading
                </Typography>
                {renderStudentSelection(task_id, groupId)}
              </Box>

              {/* All submissions for this group */}
              <Typography variant="h6" gutterBottom>
                All Submissions
              </Typography>
              <Stack spacing={1}>
                {groupSubmissions.map((submission, index) => (
                  <Accordion key={`submission_${groupId}_${index}`} variant="outlined">
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant={"body1"}>
                          Attempt at {new Date(submission["created_at"]).toLocaleString()}
                        </Typography>
                        <Typography variant={"body2"} color="text.secondary">
                          Status: {JobStatusMap[submission.status] || submission.status}
                        </Typography>
                        {submission["marked_for_grading"] ? (
                          <CheckCircle sx={{ color: "success.light" }} />
                        ) : null}
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ mb: 2 }}>
                      <Stack spacing={2}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell>Submission ID</TableCell>
                              <TableCell>{submission.submission_id}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Status</TableCell>
                              <TableCell>
                                {JobStatusMap[submission.status] || submission.status}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Runtime Limit</TableCell>
                              <TableCell>{submission.run_time_limit}s</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>RAM Limit</TableCell>
                              <TableCell>{submission.ram_limit}MB</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        {renderSubmissionResult(submission.submission_id)}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );

  return (
    <>
      <Container component="main" maxWidth="lg">
        <CssBaseline />
        <Typography variant="h4" gutterBottom>
          {isAdmin ? "All Submissions" : "My Submissions"}
        </Typography>
        {loading || !course ? (
          <CircularProgress />
        ) : isAdmin ? (
          renderAdminView()
        ) : (
          renderStudentView()
        )}

        {/* Job Status Dialog */}
        <Dialog
          open={openJobStatus}
          onClose={() => setOpenJobStatus(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Latest Job Status</DialogTitle>
          <DialogContent>
            {jobStatus ? (
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Worker Name</TableCell>
                    <TableCell>{jobStatus.worker_name || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>{JobStatusMap[jobStatus.status]}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Error</TableCell>
                    <TableCell>{jobStatus.error ? JobErrorMap[jobStatus.error] : "None"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              "Loading"
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenJobStatus(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Submissions;
