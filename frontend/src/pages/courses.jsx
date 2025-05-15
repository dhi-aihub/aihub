import React, { useEffect, useState } from "react";
import { CircularProgress, Container, CssBaseline, Grid } from "@mui/material";
import { CourseCard } from "../components/courseCard";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectLoggedIn } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { cleanAuthStorage } from "../lib/auth";
import catalogueService from "../lib/api/catalogueService";

const CoursePage = () => {
  const isLoggedIn = useSelector(selectLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    catalogueService
      .get("/courses/")
      .then(resp => {
        const courses = resp.data["data"];
        setCourses(courses);
        setLoading(false);
      })
      .catch(e => {
        console.log(e);
      });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      cleanAuthStorage();
      dispatch(logout());
      navigate("/signin");
    }
  }, [isLoggedIn, dispatch, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <React.Fragment>
      <Container component="main" maxWidth="lg">
        <CssBaseline />
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container marginTop={3} spacing={3}>
            {courses.map((course, idx) => {
              return (
                <Grid key={idx} item xs={12} sm={4}>
                  <CourseCard
                    name={course.code}
                    semester={`Semester ${course.semester}`}
                    id={course.id}
                    participating={course.participation !== null}
                    role={course.participation === null ? null : course.participation}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </React.Fragment>
  );
};

export default CoursePage;
