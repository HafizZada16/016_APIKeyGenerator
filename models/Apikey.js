const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Apikey = sequelize.define(
  "apikey",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // UBAH JADI TRUE agar bisa generate key dulu tanpa user
      references: {
        model: "user",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    last_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    outofdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Expiration date",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "expired"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "apikey",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Apikey;
