import jwt from "jsonwebtoken";

const age = 5 * 24 * 60 * 60;

export const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1w",
  });

  return token;
};

export function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    month: "short",
    day: "2-digit",
    year: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
}
