import React, { useEffect } from "react";
import { useNavigate, useParams, Link as RouterLink, useSearchParams } from "react-router-dom";
import { Box, Button, CircularProgress, Container, CssBaseline, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupSetId = searchParams.get("groupSetId");

  function handleDeleteGroupSet() {
    // Implement the logic to delete a group set
    console.log(`Delete group set with ID: ${groupSetId}`);
    navigate(`/courses/${id}/groups`);
  }

  return (
    <Box>
      <AdminButton variant={"outlined"} component={RouterLink} to={""}>
        Edit Group Set
      </AdminButton>
      <AdminButton
        variant={"outlined"}
        component={RouterLink}
        color="error"
        onClick={handleDeleteGroupSet}
      >
        Delete Group Set
      </AdminButton>
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
        const groupSetsResponse = await catalogueService.get(`/courses/${id}/groupSets/`);
        setGroupSets(groupSetsResponse.data["data"]);
        if (groupSetId && !groupSetsResponse.data["data"].some(set => set.id === groupSetId)) {
          navigate(`/courses/${id}/groups`);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };

    fetchCourse();
  }, [id]);

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
        </Box>
      )}
    </Container>
  );
};

export default ManageGroups;
