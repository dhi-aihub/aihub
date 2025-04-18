import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import GroupParticipation from "./groupParticipation-model.js";

const Group = sequelize.define("group", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
        unique: true,
    }
});

Group.hasMany(GroupParticipation, {
    foreignKey: {
        name: "groupId",
        allowNull: false,
    },
    onDelete: "CASCADE",
});
GroupParticipation.belongsTo(Group);


export default Group;