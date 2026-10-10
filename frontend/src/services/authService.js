import axiosPublic from "@/lib/axiosPublic";

export const login = async (credentials) => {
  const response = await axiosPublic.post(
    "/auth/login",
    credentials
  );

  return response.data;
};

export const register = async (userData) => {
  const response = await axiosPublic.post(
    "/auth/register",
    userData
  );

  return response.data;
};

export const getProfile = async () => {
  const response = await axiosPublic.get(
    "/auth/profile"
  );

  return response.data;
};