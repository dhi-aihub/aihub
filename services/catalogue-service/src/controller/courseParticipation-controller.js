import { response } from "express";
import { userService } from "../lib/api.js";
import CourseParticipation from "../models/courseParticipation-model.js";

export async function getCourseParticipations(req, res) {
  try {
    const courseParticipations = await CourseParticipation.findAll();
    res.status(200).json({ message: "CourseParticipations retrieved", data: courseParticipations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Get all course participations for a specific course
 */
export async function getCourseParticipationsByCourse(req, res) {
  try {
    const { courseId } = req.params;
    const courseParticipations = await CourseParticipation.findAll({ where: { courseId } });
    res.status(200).json({ message: "CourseParticipations retrieved", data: courseParticipations });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createCourseParticipation(req, res) {
  try {
    const { courseId } = req.params;
    const { email, role = "STU" } = req.body;

    // Validation of the required fields
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    console.log("Processing email:", email);

    // Get userId from User Service
    const response = await userService.post("/users/ids-from-emails/", { 
      emails: [email] 
    });
    const userIds = response.data.userIds;

    // Check if user is valid
    if (!userIds || userIds.length === 0 || !userIds[0]) {
      return res.status(404).json({ message: `User with the provided email ${email} not found` });
    }
    const userId = userIds[0];

    // Check if the participation already exists
    const existingParticipation = await CourseParticipation.findOne({ where: { userId, courseId } });
    if (existingParticipation) {
      return res.status(409).json({ message: "User is already enrolled in this course" });
    }

    // Create the participation
    const participation = await CourseParticipation.create({ userId, courseId, role });
    res.status(201).json({ message: "CourseParticipation created", data: participation });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createCourseParticipationBulk(req, res) {
  try {
    const { courseId } = req.params;

    // body format: [[email1, role1], [email2, role2], ...]
    const emails = req.body.data.map(item => item[0]);

    console.log("Emails to process:", emails);

    // get userId from user service
    // docker network create aihub-network
    const response = await userService.post("/users/ids-from-emails/", { emails });
    const userIds = response.data.userIds;

    // Prepare data for bulk create
    const data = userIds.map((userId, index) => ({
      userId,
      courseId,
      role: req.body.data[index][1],
    }));

    // Drop existing participations for the course
    await CourseParticipation.destroy({ where: { courseId } });

    // Bulk create participations
    await CourseParticipation.bulkCreate(data);
    res.status(201).json({ message: "CourseParticipations created" });
  } catch (error) {
    console.error("Error creating course participations:", error);
    res.status(500).json({ message: error.message });
  }
}

export async function deleteCourseParticipation(req, res) {
  try {
    const { userId, courseId } = req.params;
    const participation = await CourseParticipation.findOne({ where: { userId, courseId } });
    if (!participation) {
      res.status(404).json({ message: "CourseParticipation not found" });
      return;
    }
    participation.destroy();
    res.status(200).json({ message: "CourseParticipation deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
