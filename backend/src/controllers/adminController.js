const AdminService = require("../services/adminService");

const AdminController = {
  async getDashboardStats(req, res) {
    try {
      const stats =
        await AdminService.getDashboardStats();

      return res.status(200).json({
        success: true,
        message:
          "Admin dashboard statistics fetched successfully.",
        data: {
          totalUsers: Number(stats.total_users),
          totalIncomeRecords: Number(
            stats.total_income_records,
          ),
          totalExpenseRecords: Number(
            stats.total_expense_records,
          ),
          totalTaxCalculations: Number(
            stats.total_tax_calculations,
          ),
        },
      });
    } catch (error) {
      console.error(
        "Admin Dashboard Error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  async getAllUsers(req, res) {
    try {
      const users =
        await AdminService.getAllUsers();

      return res.status(200).json({
        success: true,
        message: "Users fetched successfully.",
        data: users,
      });
    } catch (error) {
      console.error(
        "Get All Users Error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  async getUserById(req, res) {
    try {
      const user =
        await AdminService.getUserById(
          req.params.id,
        );

      return res.status(200).json({
        success: true,
        message: "User fetched successfully.",
        data: user,
      });
    } catch (error) {
      if (
        error.message === "Invalid user ID." ||
        error.message === "User not found."
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      console.error(
        "Get User By ID Error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  async updateUserRole(req, res) {
    try {
      const { role } = req.body;

      const user =
        await AdminService.updateUserRole(
          req.params.id,
          role,
          req.user.id,
        );

      return res.status(200).json({
        success: true,
        message: "User role updated successfully.",
        data: user,
      });
    } catch (error) {
      if (
        error.message === "Invalid user ID." ||
        error.message === "User not found." ||
        error.message.includes("Invalid role") ||
        error.message.includes(
          "cannot change your own",
        )
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      console.error(
        "Update User Role Error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  async deleteUser(req, res) {
    try {
      await AdminService.deleteUser(
        req.params.id,
        req.user.id,
      );

      return res.status(200).json({
        success: true,
        message: "User deleted successfully.",
      });
    } catch (error) {
      if (
        error.message === "Invalid user ID." ||
        error.message === "User not found." ||
        error.message.includes(
          "cannot delete your own",
        )
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      console.error(
        "Delete User Error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },
};

module.exports = AdminController;