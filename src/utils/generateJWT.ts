import jwt from "jsonwebtoken";

export function generateJWT(payload: unknown): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing required parameter: JWT_SECRET");
  }

  const expiresInRaw = process.env.JWT_EXPIRES_IN;
  if (expiresInRaw) {
    const expiresInNumber = Number(expiresInRaw);
    const options: jwt.SignOptions = {
      expiresIn: Number.isFinite(expiresInNumber)
        ? expiresInNumber
        : (expiresInRaw as jwt.SignOptions["expiresIn"]),
    };

    return jwt.sign({ payload }, secret, options);
  }

  return jwt.sign({ payload }, secret);
}

export default generateJWT;
