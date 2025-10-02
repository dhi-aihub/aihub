import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link as RouterLink, useSearchParams } from "react-router-dom";

import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { ROLE_ADMIN, ROLE_LECTURER } from "../constants";

import userService from "../lib/api/userService";
import catalogueService from "../lib/api/catalogueService";

const GroupCard = ({ group, isAdmin, onStudentAdded, groupSet }) => {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!group || !group.groupParticipations) {
    console.error("GroupCard: Invalid group data", group);
    return <Typography>Error: Invalid group data</Typography>;
  }

  const currentMemberCount = group.groupParticipations.length;
  const maxGroupSize = groupSet?.maxGroupSize || groupSet?.groupSize;
  const isAtMaxCapacity = maxGroupSize && currentMemberCount >= maxGroupSize;

  const getUserDetails = async userIds => {
    try {
      const response = await userService.post("/users/details-from-ids/", {
        userIds: userIds,
      });

      const data = response.data;
      return data.users;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await catalogueService.get(`/courseParticipations/${id}/`);
      const userResponse = await getUserDetails(
        response.data["data"].map(student => student.userId),
      );

      const availableStudents = userResponse.filter(
        student => !enrolledStudents.map(s => s.id).includes(student.id),
      );

      setAvailableStudents(availableStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  // Function to fetch enrolled students
  const fetchEnrolledStudents = async () => {
    const userIds = group.groupParticipations
      .map(p => p.userId)
      .filter(userId => userId !== undefined);

    if (userIds.length > 0) {
      try {
        const enrolled = await getUserDetails(userIds);
        setEnrolledStudents(enrolled);
      } catch (error) {
        console.error("Failed to fetch enrolled students:", error);
      }
    } else {
      setEnrolledStudents([]);
    }
  };

  // Handle accordion expand/collapse
  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);

    if (isExpanded) {
      fetchEnrolledStudents();
    }
  };

  const handleAddStudents = async () => {
    setLoading(true);
    try {
      for (const student of selectedStudents) {
        console.log("Adding student:", student.id);
        await catalogueService.post(`/groupParticipations/${group.id}`, {
          groupId: group.id,
          userId: student.id,
        });
      }

      alert("Students added successfully");
      setOpen(false);

      setSelectedStudents([]);
      setTimeout(() => {
        if (onStudentAdded) {
          onStudentAdded();
        }
      }, 500);
    } catch (error) {
      console.error("Failed to add students:", error);
      alert("Error adding students");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async participationId => {
    if (window.confirm("Are you sure you want to remove this student from the group?")) {
      try {
        const participation = group.groupParticipations.find(p => p.userId === participationId);

        await catalogueService.delete(`/groupParticipations/${participation.id}/`);
        alert("Student removed successfully");

        setTimeout(() => {
          if (onStudentAdded) {
            onStudentAdded();
          }
        }, 500);
      } catch (error) {
        console.error("Failed to remove student:", error);
        alert("Error removing student");
      }
    }
  };

  return (
    <>
      <Accordion expanded={expanded} onChange={handleAccordionChange}>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography variant="h6">{group.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginRight: 2 }}>
              ({currentMemberCount}
              {maxGroupSize ? `/${maxGroupSize}` : ""} members)
              {isAtMaxCapacity && (
                <Typography component="span" color="success.main" sx={{ marginLeft: 1 }}>
                  (Full)
                </Typography>
              )}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {enrolledStudents.map(student => (
              <Box
                key={student.id}
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Typography>{student.username}</Typography>
                {isAdmin && (
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleRemoveStudent(student.id)}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            ))}
            {isAdmin && (
              <Box sx={{ marginTop: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  disabled={isAtMaxCapacity}
                  onClick={() => {
                    setOpen(true);
                    fetchAvailableStudents();
                  }}
                >
                  {isAtMaxCapacity ? "Group Full" : "Add Students"}
                </Button>
                {isAtMaxCapacity && (
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Maximum group size ({maxGroupSize}) reached
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Students to {group.name}</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={availableStudents}
            getOptionLabel={option => `${option.username}`}
            value={selectedStudents}
            onChange={(event, newValue) => {
              const remainingSlots = maxGroupSize
                ? maxGroupSize - currentMemberCount
                : newValue.length;
              const limitedSelection = newValue.slice(0, remainingSlots);
              setSelectedStudents(limitedSelection);
            }}
            renderInput={params => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Students"
                placeholder="Search students..."
                margin="normal"
                fullWidth
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.username}
                  {...getTagProps({ index })}
                  key={option.userId}
                />
              ))
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddStudents}
            variant="contained"
            disabled={loading || selectedStudents.length === 0}
          >
            {loading ? <CircularProgress size={20} /> : "Add Students"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const GroupsList = ({ isAdmin, groupSet }) => {
  const [searchParams] = useSearchParams();
  const groupSetId = searchParams.get("groupSetId");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = () => {
    if (groupSetId === null) {
      return;
    }
    setLoading(true);
    catalogueService
      .get(`/groups/groupSet/${groupSetId}/`)
      .then(resp => {
        const groupsData = resp.data["data"];

        if (Array.isArray(groupsData)) {
          const sortedGroups = groupsData.sort((a, b) => a.id - b.id);
          setGroups(sortedGroups);
        } else {
          console.error("Invalid groups data:", groupsData);
          setGroups([]);
        }

        setLoading(false);
      })
      .catch(e => {
        console.error("Error fetching groups:", e);
        setGroups([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGroups();
  }, [groupSetId]);

  return groupSetId === null ? (
    <Typography>Please select a group set.</Typography>
  ) : loading ? (
    <CircularProgress />
  ) : (
    <Box sx={{ display: "flex", flexDirection: "column", marginTop: 5 }}>
      {groups.map(group => (
        <GroupCard
          group={group}
          key={group.id}
          isAdmin={isAdmin}
          onStudentAdded={fetchGroups}
          groupSet={groupSet}
        />
      ))}
    </Box>
  );
};

const GroupSetsList = ({ groupSets, selectedGroupSetId, isAdmin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [groupsBySet, setGroupsBySet] = useState({});
  const [loadingGroups, setLoadingGroups] = useState({});

  // Fetch groups for a specific group set
  const fetchGroupsForSet = async groupSetId => {
    if (loadingGroups[groupSetId]) return;

    setLoadingGroups(prev => ({ ...prev, [groupSetId]: true }));

    try {
      const response = await catalogueService.get(`/groups/groupSet/${groupSetId}/`);
      const groupsData = response.data["data"];

      if (Array.isArray(groupsData)) {
        const sortedGroups = groupsData.sort((a, b) => a.id - b.id);
        setGroupsBySet(prev => ({ ...prev, [groupSetId]: sortedGroups }));
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroupsBySet(prev => ({ ...prev, [groupSetId]: [] }));
    } finally {
      setLoadingGroups(prev => ({ ...prev, [groupSetId]: false }));
    }
  };

  // Refresh groups for a specific set
  const refreshGroupsForSet = groupSetId => {
    fetchGroupsForSet(groupSetId);
  };

  // Handle group set click - toggle selection
  const handleGroupSetClick = groupSetId => {
    if (selectedGroupSetId === groupSetId.toString()) {
      // If already selected, unselect (navigate without groupSetId parameter)
      navigate(`/courses/${id}/groups`);
    } else {
      // Select new group set
      navigate(`/courses/${id}/groups?groupSetId=${groupSetId}`);
      if (!groupsBySet[groupSetId]) {
        fetchGroupsForSet(groupSetId);
      }
    }
  };

  return (
    <Box sx={{ marginTop: 3 }}>
      <Typography variant="h5" gutterBottom>
        All Group Sets
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {groupSets.map(groupSet => (
          <Box
            key={groupSet.id}
            sx={{
              border: 2,
              borderColor:
                selectedGroupSetId === groupSet.id.toString() ? "primary.main" : "grey.300",
              borderRadius: 1,
              overflow: "hidden",
              boxShadow: selectedGroupSetId === groupSet.id.toString() ? 2 : 0,
            }}
          >
            {/* Group Set Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 2,
                backgroundColor:
                  selectedGroupSetId === groupSet.id.toString() ? "primary.main" : "grey.50",
                color: selectedGroupSetId === groupSet.id.toString() ? "white" : "text.primary",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor:
                    selectedGroupSetId === groupSet.id.toString() ? "primary.dark" : "grey.100",
                },
              }}
              onClick={() => handleGroupSetClick(groupSet.id)}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: selectedGroupSetId === groupSet.id.toString() ? "white" : "inherit",
                  }}
                >
                  {groupSet.name}
                </Typography>
                {groupSet.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      marginBottom: 1,
                      color:
                        selectedGroupSetId === groupSet.id.toString()
                          ? "rgba(255,255,255,0.7)"
                          : "text.secondary",
                    }}
                  >
                    {groupSet.description}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        selectedGroupSetId === groupSet.id.toString()
                          ? "rgba(255,255,255,0.7)"
                          : "text.secondary",
                    }}
                  >
                    <strong>Group Size:</strong> {groupSet.groupSize || "Not specified"}
                  </Typography>
                  {groupSet.maxGroupSize && (
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          selectedGroupSetId === groupSet.id.toString()
                            ? "rgba(255,255,255,0.7)"
                            : "text.secondary",
                      }}
                    >
                      <strong>Max Group Size:</strong> {groupSet.maxGroupSize}
                    </Typography>
                  )}
                  {groupSet.minGroupSize && (
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          selectedGroupSetId === groupSet.id.toString()
                            ? "rgba(255,255,255,0.7)"
                            : "text.secondary",
                      }}
                    >
                      <strong>Min Group Size:</strong> {groupSet.minGroupSize}
                    </Typography>
                  )}
                </Box>
              </Box>
              {isAdmin && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant={
                      selectedGroupSetId === groupSet.id.toString() ? "contained" : "outlined"
                    }
                    sx={{
                      backgroundColor:
                        selectedGroupSetId === groupSet.id.toString()
                          ? "rgba(255,255,255,0.1)"
                          : "transparent",
                      color:
                        selectedGroupSetId === groupSet.id.toString() ? "white" : "primary.main",
                      borderColor:
                        selectedGroupSetId === groupSet.id.toString()
                          ? "rgba(255,255,255,0.3)"
                          : "primary.main",
                      "&:hover": {
                        backgroundColor:
                          selectedGroupSetId === groupSet.id.toString()
                            ? "rgba(255,255,255,0.2)"
                            : "primary.light",
                      },
                    }}
                    component={RouterLink}
                    to={`/courses/${id}/groups/edit_group_set/${groupSet.id}`}
                    onClick={e => e.stopPropagation()}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant={
                      selectedGroupSetId === groupSet.id.toString() ? "contained" : "outlined"
                    }
                    color="error"
                    sx={{
                      backgroundColor:
                        selectedGroupSetId === groupSet.id.toString()
                          ? "rgba(255,255,255,0.1)"
                          : "transparent",
                      color: selectedGroupSetId === groupSet.id.toString() ? "white" : "error.main",
                      borderColor:
                        selectedGroupSetId === groupSet.id.toString()
                          ? "rgba(255,255,255,0.3)"
                          : "error.main",
                      "&:hover": {
                        backgroundColor:
                          selectedGroupSetId === groupSet.id.toString()
                            ? "rgba(255,255,255,0.2)"
                            : "error.light",
                      },
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${groupSet.name}"?`)) {
                        catalogueService
                          .delete(`/groupSets/${groupSet.id}/`)
                          .then(() => {
                            alert("Group set deleted successfully");
                            window.location.reload();
                          })
                          .catch(error => {
                            alert("Cannot delete group set with associated tasks");
                            console.error("Error deleting group set:", error.message);
                          });
                      }
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Box>

            {/* Groups List for this Group Set */}
            {selectedGroupSetId === groupSet.id.toString() && (
              <Box sx={{ padding: 2, backgroundColor: "background.paper" }}>
                {loadingGroups[groupSet.id] ? (
                  <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : groupsBySet[groupSet.id] ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="h6" sx={{ marginBottom: 1 }}>
                      Groups in {groupSet.name}
                    </Typography>
                    {groupsBySet[groupSet.id].map(group => (
                      <GroupCard
                        group={group}
                        key={group.id}
                        isAdmin={isAdmin}
                        onStudentAdded={() => refreshGroupsForSet(groupSet.id)}
                        groupSet={groupSet}
                      />
                    ))}
                  </Box>
                ) : null}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const ManageGroups = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const groupSetId = searchParams.get("groupSetId");
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [course, setCourse] = React.useState(null);
  const [groupSets, setGroupSets] = React.useState([]);
  const isAdmin =
    course && (course.participation === ROLE_ADMIN || course.participation === ROLE_LECTURER);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseResponse = await catalogueService.get(`/courses/${id}/`);
        setCourse(courseResponse.data["data"]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    const fetchGroupSets = async () => {
      try {
        const response = await catalogueService.get(`/courses/${id}/groupSets/`);
        setGroupSets(response.data["data"]);
      } catch (error) {
        console.error("Failed to fetch group sets:", error);
      }
    };
    fetchGroupSets();
  }, [id]);

  return (
    <Container component="main" maxWidth="lg" sx={{ paddingBottom: 4 }}>
      <CssBaseline />
      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          <Typography variant="h4" gutterBottom>
            Groups
          </Typography>
          <GroupSetsList groupSets={groupSets} selectedGroupSetId={groupSetId} isAdmin={isAdmin} />
        </Box>
      )}
    </Container>
  );
};

export default ManageGroups;
