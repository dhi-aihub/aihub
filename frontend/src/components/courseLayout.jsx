import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import CourseSideBar from "./courseSideBar";
import catalogueService from "../lib/api/catalogueService";

const CourseLayout = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await catalogueService.get(`/courses/${id}/`);
        setCourse(response.data["data"]);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };

    fetchCourse();
  }, [id]);

  return (
    course && (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <CourseSideBar course={course} />
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    )
  );
};

export default CourseLayout;
