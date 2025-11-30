export const successResponse = (message, data = {}) => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message) => ({
  success: false,
  message,
});
