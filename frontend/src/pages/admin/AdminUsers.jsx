import { useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle,
  Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

import AdminService from "@/services/adminService";
import useAuth from "@/hooks/useAuth";

const AdminUsers = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingUserId, setUpdatingUserId] =
    useState(null);

  const [deletingUserId, setDeletingUserId] =
    useState(null);

  const [deleteUser, setDeleteUser] =
    useState(null);

  // load users

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await AdminService.getAllUsers();

      setUsers(response.data || []);
    } catch (error) {
      console.error(
        "Admin users error:",
        error,
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    let cancelled = false;

    AdminService.getAllUsers()
      .then((response) => {
        if (cancelled) {
          return;
        }

        setUsers(response?.data || []);
        setError("");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Admin users error:",
          error,
        );

        setUsers([]);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load users.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // role change

  const handleRoleChange = async (
    userId,
    newRole,
  ) => {
    try {
      setUpdatingUserId(userId);

      const response =
        await AdminService.updateUserRole(
          userId,
          newRole,
        );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? response.data
            : user,
        ),
      );

      toast.success(
        "User role updated successfully.",
      );
    } catch (error) {
      console.error(
        "Update user role error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update user role.",
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // delete user

  const handleDeleteUser = async () => {
    if (!deleteUser) {
      return;
    }

    try {
      setDeletingUserId(deleteUser.id);

      await AdminService.deleteUser(
        deleteUser.id,
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) =>
            user.id !== deleteUser.id,
        ),
      );

      toast.success(
        "User deleted successfully.",
      );

      setDeleteUser(null);
    } catch (error) {
      console.error(
        "Delete user error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete user.",
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  // format date

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  // loading

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-slate-500" />

          <p className="mt-3 text-sm text-slate-500">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  // error

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <XCircle className="mx-auto h-8 w-8 text-red-600" />

          <h2 className="mt-3 text-lg font-semibold text-red-800">
            Unable to load users
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadUsers}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // main ui

  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="h-4 w-4" />

            <span>
              Administration
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            User Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage registered users and their system roles.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid gap-5 md:grid-cols-3">

        {/* Total Users */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Users
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {users.length}
          </p>
        </div>

        {/* Administrators */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Administrators
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {
              users.filter(
                (user) =>
                  user.role === "admin",
              ).length
            }
          </p>
        </div>

        {/* Regular Users */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Regular Users
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {
              users.filter(
                (user) =>
                  user.role === "user",
              ).length
            }
          </p>
        </div>

      </div>

      {/* =====================================================
          USERS TABLE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            All Users
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Registered accounts in the system.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 text-slate-500">
              No users found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>

                  <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {users.map((user) => {
                  const isCurrentUser =
                    Number(user.id) ===
                    Number(currentUser?.id);

                  const isUpdating =
                    updatingUserId ===
                    user.id;

                  const isDeleting =
                    deletingUserId ===
                    user.id;

                  return (
                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* USER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                            <UserRound className="h-5 w-5 text-slate-600" />
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {user.full_name}
                            </p>

                            <p className="text-xs text-slate-400">
                              ID: {user.id}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* CONTACT */}

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {user.email}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {user.phone || "-"}
                        </p>
                      </td>

                      {/* ROLE */}

                      <td className="px-5 py-4">

                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            <UserRound className="h-3.5 w-3.5" />
                            User
                          </span>
                        )}

                      </td>

                      {/* CREATED */}

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          user.created_at,
                        )}
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">

                        {isCurrentUser ? (
                          <span className="block text-right text-xs text-slate-400">
                            Current account
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">

                            <select
                              value={user.role}
                              disabled={
                                isUpdating ||
                                isDeleting
                              }
                              onChange={(event) =>
                                handleRoleChange(
                                  user.id,
                                  event.target.value,
                                )
                              }
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="user">
                                User
                              </option>

                              <option value="admin">
                                Admin
                              </option>
                            </select>

                            <button
                              type="button"
                              disabled={
                                isUpdating ||
                                isDeleting
                              }
                              onClick={() =>
                                setDeleteUser(
                                  user,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />

                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Delete User?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-700">
                    {deleteUser.full_name}
                  </span>
                  ?
                </p>

                <p className="mt-2 text-sm leading-6 text-red-600">
                  This action will permanently delete
                  this user's account and all
                  user-owned data.
                </p>

              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                disabled={
                  deletingUserId !== null
                }
                onClick={() =>
                  setDeleteUser(null)
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deletingUserId !== null
                }
                onClick={handleDeleteUser}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />

                {deletingUserId !== null
                  ? "Deleting..."
                  : "Delete User"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default AdminUsers;