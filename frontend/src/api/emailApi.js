import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const fetchEmails = (email, password, limit) =>
  axios.post(`${API_URL}/retrieve-emails`, { email, password, limit });