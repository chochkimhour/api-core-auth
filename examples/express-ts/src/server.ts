import express, { type Request, type Response } from "express";
import {
  authMiddleware,
  compareOpaqueToken,
  comparePassword,
  createOpaqueToken,
  roleMiddleware,
  sanitizeUser,
  type AuthUser
} from "api-core-auth";

const app = express();
const tokenPepper = process.env.OPAQUE_TOKEN_PEPPER;

const tokenStore = new Map<
  string,
  {
    tokenHash: string;
    user: AuthUser;
  }
>();

app.use(express.json());

app.post("/login", async (req: Request, res: Response) => {
  const user = {
    id: "1",
    email: "admin@example.com",
    password: "$2a$10$1Yyt8Txs5SkApwvEI5qtl.UTs8ZPMZ0OPWTSnFF0UU/eei9IkwfMa",
    role: "ADMIN"
  };

  const isValidPassword = await comparePassword(req.body.password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }

  const safeUser = sanitizeUser(user) as AuthUser;
  const authToken = createOpaqueToken({
    pepper: tokenPepper
  });

  tokenStore.set(String(user.id), {
    tokenHash: authToken.tokenHash,
    user: safeUser
  });

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      user: safeUser,
      token: authToken.token
    }
  });
});

const verifyStoredToken = (token: string): AuthUser | null => {
  for (const session of tokenStore.values()) {
    if (compareOpaqueToken(token, session.tokenHash, tokenPepper)) {
      return session.user;
    }
  }

  return null;
};

app.get(
  "/profile",
  authMiddleware({
    verifyToken: verifyStoredToken
  }),
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Profile fetched successfully",
      data: req.user
    });
  }
);

app.get(
  "/admin",
  authMiddleware({
    verifyToken: verifyStoredToken
  }),
  roleMiddleware(["ADMIN"]),
  (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Admin route accessed successfully"
    });
  }
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
