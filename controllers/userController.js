const { User, Apikey } = require("../models");
const { Sequelize } = require("sequelize");

// Get all users (Updated for Admin Dashboard)
// Menampilkan list user beserta data API Key mereka
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: Apikey,
          as: "apikeys",
          attributes: [
            "id",
            "key",
            "status",
            "start_date",
            "last_date",
            "outofdate",
          ],
          // Urutkan key dari yang terbaru
          order: [["created_at", "DESC"]],
        },
      ],
      // Urutkan user dari yang terbaru mendaftar
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get user by ID
// Menampilkan detail user dan semua history API Key mereka
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: Apikey,
          as: "apikeys",
          attributes: [
            "id",
            "key",
            "start_date",
            "last_date",
            "outofdate",
            "status",
            "created_at",
          ],
          order: [["created_at", "DESC"]],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
};
