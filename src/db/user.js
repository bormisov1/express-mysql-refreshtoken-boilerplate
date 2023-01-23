const { DataTypes } = require("sequelize");

module.exports = {
  fields: {
    id: {
      // todo write and query same formatted emails or phone numbers
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    passHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessToken: {
      type: "BINARY(64)",
      unique: true,
    },
    refreshToken: {
      type: "BINARY(64)",
      unique: true,
    },
  },
  options: {
    indexes: [
      {
        unique: true,
        fields: ["id"],
      },
    ],
  },
};
