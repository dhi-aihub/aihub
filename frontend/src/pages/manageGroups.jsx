import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link as RouterLink, useSearchParams } from "react-router-dom";
import { Box, Button, CircularProgress, Container, CssBaseline, Typography } from "@mui/material";
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupSetId = searchParams.get("groupSetId");

  function handleDeleteGroupSet() {
    console.log(`Delete group set with ID: ${groupSetId}`);
    catalogueService
      .delete(`/groupSets/${groupSetId}/`)
      .then(() => {
        alert("Group set deleted successfully");
        navigate(`/courses/${id}/groups`);
      })
      .catch(error => {
        alert("Cannot delete group set with associated tasks");
      });
  }

  return (
    <Box>
      <AdminButton variant={"outlined"} component={RouterLink} to={""} disabled={!groupSetId}>
        Edit Group Set
      </AdminButton>
      <AdminButton
        variant={"outlined"}
        color="error"
        onClick={handleDeleteGroupSet}
        disabled={!groupSetId}
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

const GroupCard = ({ group }) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
        <Typography variant="h6">{group.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {group.groupParticipations.map(participation => (
          <Typography key={participation.id}>{participation.userDetail.username}</Typography>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

const GroupsList = () => {
  const [searchParams] = useSearchParams();
  const groupSetId = searchParams.get("groupSetId");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupSetId === null) {
      return;
    }
    setLoading(true);
    catalogueService
      .get(`/groups/groupSet/${groupSetId}/`)
      .then(resp => {
        const groupsData = resp.data["data"];
        setGroups(groupsData);
        setLoading(false);
      })
      .catch(e => {
        console.log(e);
      });
  }, [groupSetId]);

  return groupSetId === null ? (
    <Typography>Please select a group set.</Typography>
  ) : loading ? (
    <CircularProgress />
  ) : (
    <Box sx={{ display: "flex", flexDirection: "column", marginTop: 5 }}>
      {groups.map(group => (
        <GroupCard group={group} key={group.id} />
      ))}
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
          <GroupsList />
        </Box>
      )}
    </Container>
  );
};

export default ManageGroups;
