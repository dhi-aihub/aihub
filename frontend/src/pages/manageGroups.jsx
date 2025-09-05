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
import { styled } from "@mui/material/styles";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { ROLE_ADMIN, ROLE_LECTURER } from "../constants";
import catalogueService from "../lib/api/catalogueService";

const AdminButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const ControlPanel = () => {
  const { id } = useParams();

  return (
    <Box>
      <AdminButton
        variant={"outlined"}
        component={RouterLink}
        to={`/courses/${id}/groups/create_group_set`}
      >
        Create New Group Set
      </AdminButton>
    </Box>
  );
};

const GroupCard = ({ group, isAdmin, onStudentAdded, groupSet }) => {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!group || !group.groupParticipations) {
    console.error("GroupCard: Invalid group data", group);
    return <Typography>Error: Invalid group data</Typography>;
  }

  const currentMemberCount = group.groupParticipations.length;
  const maxGroupSize = groupSet?.maxGroupSize || groupSet?.groupSize;
  const isAtMaxCapacity = maxGroupSize && currentMemberCount >= maxGroupSize;

  const fetchAvailableStudents = async () => {
    try {
      const response = await catalogueService.get(`/courseParticipations/${id}/`);
      const enrolledStudentIds = group.groupParticipations
        .map(p => p.userDetail?.id)
        .filter(id => id !== undefined);
      const availableStudents = response.data["data"].filter(
        student => !enrolledStudentIds.includes(student.id),
      );
      setStudents(availableStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const handleAddStudents = async () => {
    setLoading(true);
    try {
      for (const student of selectedStudents) {
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
        await catalogueService.delete(`/groupParticipations/${participationId}/`);
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
      <Accordion>
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
            {group.groupParticipations.map(participation => (
              <Box
                key={participation.id}
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Typography>{participation.userId}</Typography>
                {isAdmin && (
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleRemoveStudent(participation.id)}
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
            options={students}
            getOptionLabel={option => `${option.id}`}
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
                  label={option.userId}
                  {...getTagProps({ index })}
                  key={option.id}
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

const GroupSetsList = ({ groupSets, selectedGroupSetId }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box sx={{ marginTop: 3 }}>
      <Typography variant="h5" gutterBottom>
        All Group Sets
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {groupSets.map(groupSet => (
          <Box
            key={groupSet.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 2,
              border: 1,
              borderColor:
                selectedGroupSetId === groupSet.id.toString() ? "primary.main" : "grey.300",
              borderRadius: 1,
              backgroundColor:
                selectedGroupSetId === groupSet.id.toString() ? "primary.light" : "transparent",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "grey.100",
              },
            }}
            onClick={() => navigate(`/courses/${id}/groups?groupSetId=${groupSet.id}`)}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{groupSet.name}</Typography>
              {groupSet.description && (
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                  {groupSet.description}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Group Size:</strong> {groupSet.groupSize || "Not specified"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Number of Groups:</strong> {groupSet.numberOfGroups || "Not specified"}
                </Typography>
                {groupSet.maxGroupSize && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Max Group Size:</strong> {groupSet.maxGroupSize}
                  </Typography>
                )}
                {groupSet.minGroupSize && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Min Group Size:</strong> {groupSet.minGroupSize}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to={`/courses/${id}/groups/edit_group_set/${groupSet.id}`}
                onClick={e => e.stopPropagation()}
              >
                Edit
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
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
  const selectedGroupSet = groupSets.find(gs => gs.id === parseInt(groupSetId));

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
  }, [id, groupSetId]);

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          <Typography variant="h4" gutterBottom>
            Groups
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <FormControl sx={{ minWidth: 400, marginRight: 2 }}>
              <InputLabel id="group-set-select-label">Selected Group Set</InputLabel>
              <Select
                labelId="group-set-select-label"
                id="group-set-select"
                value={groupSetId || ""}
                label="Selected Group Set"
                onChange={e => {
                  const selectedGroupSet = e.target.value;
                  navigate(`/courses/${id}/groups?groupSetId=${selectedGroupSet}`);
                }}
              >
                {groupSets.map(groupSet => (
                  <MenuItem key={groupSet.id} value={groupSet.id}>
                    {groupSet.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isAdmin && <ControlPanel />}
          </Box>
          {isAdmin && <GroupSetsList groupSets={groupSets} selectedGroupSetId={groupSetId} />}
          <GroupsList isAdmin={isAdmin} groupSet={selectedGroupSet} />
        </Box>
      )}
    </Container>
  );
};

export default ManageGroups;
