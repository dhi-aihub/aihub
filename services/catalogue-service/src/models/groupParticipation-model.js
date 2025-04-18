import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const GroupParticipation = sequelize.define("groupParticipation", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'groupId']
        }
    ]
});


export default GroupParticipation;
