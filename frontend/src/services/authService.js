import axios from "axios";

export const loginUser = async (
  username,
  password
) => {
  const response = await axios.post(
    "http://localhost:5000/api/auth/login",
    {
      username,
      password
    }
  );

  return response.data;
};

export const signupBarangayAdmin = async (
  username,
  email,
  password,
  barangayId,
  role
) => {
  const response = await axios.post(
    "http://localhost:5000/api/auth/signup/barangay-admin",
    {
      username,
      email,
      password,
      barangayId,
      role
    }
  );

  return response.data;
};
