const express = require("express");
const {
  authMiddleware,
  compareOpaqueToken,
  comparePassword,
  createOpaqueToken,
  roleMiddleware,
  sanitizeUser
} = require("api-core-auth");

const app = express();
const opaqueTokenSecret = process.env.OPAQUE_TOKEN;

const tokenStore = new Map();

app.use(express.json());

app.post("/login", async (req, res) => {
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

  const authToken = createOpaqueToken({
    pepper: opaqueTokenSecret
  });

  tokenStore.set(user.id, {
    tokenHash: authToken.tokenHash,
    user: sanitizeUser(user)
  });

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      user: sanitizeUser(user),
      token: authToken.token
    }
  });
});

app.get(
  "/profile",
  authMiddleware({
    verifyToken: (token) => {
      for (const session of tokenStore.values()) {
        if (compareOpaqueToken(token, session.tokenHash, opaqueTokenSecret)) {
          return session.user;
        }
      }

      return null;
    }
  }),
  (req, res) => {
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
    verifyToken: (token) => {
      for (const session of tokenStore.values()) {
        if (compareOpaqueToken(token, session.tokenHash, opaqueTokenSecret)) {
          return session.user;
        }
      }

      return null;
    }
  }),
  roleMiddleware(["ADMIN"]),
  (_req, res) => {
    res.json({
      success: true,
      message: "Admin route accessed successfully"
    });
  }
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
