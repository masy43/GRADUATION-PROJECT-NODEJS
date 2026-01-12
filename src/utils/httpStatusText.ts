const httpStatusText = {
  Success: "success",
  Fail: "fail",
  Error: "error",
  BadRequest: "bad_request",
  Unauthorized: "unauthorized",
  Forbidden: "forbidden",
  NotFound: "not_found",
  InternalServerError: "internal_server_error",
} as const;

export default httpStatusText;
