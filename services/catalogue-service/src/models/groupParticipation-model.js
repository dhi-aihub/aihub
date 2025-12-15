import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Group from "./group-model.js";

const GroupParticipation = sequelize.define(
  "groupParticipation",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["userId", "groupId"],
      },
    ],
  },
);

GroupParticipation.getGroupIdByGroupParticipationId = async function (groupParticipationId) {
  const groupParticipation = await GroupParticipation.findByPk(groupParticipationId);
  return groupParticipation ? groupParticipation.groupId : null;
}

GroupParticipation.isGroupParticipant = async function (userId, groupId) {
  const participation = await GroupParticipation.findOne({
    where: {
      userId: userId,
      groupId: groupId,
    },
  });
  return participation !== null;
}

export default GroupParticipation;
