import axiosPublic from "@/lib/axiosPublic";

const TaxpayerProfileService = {

  async getProfile() {
    const response = await axiosPublic.get(
      "/taxpayer-profiles",
    );

    return response.data;
  },


  async createProfile(profileData) {
    const response = await axiosPublic.post(
      "/taxpayer-profiles",
      profileData,
    );

    return response.data;
  },


  async updateProfile(profileData) {
    const response = await axiosPublic.put(
      "/taxpayer-profiles",
      profileData,
    );

    return response.data;
  },
};

export default TaxpayerProfileService;