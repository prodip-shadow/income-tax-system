import axiosPublic from "@/lib/axiosPublic";

export const getServerStatus = async () => {
    const { data } = await axiosPublic.get("/");
    return data;
};