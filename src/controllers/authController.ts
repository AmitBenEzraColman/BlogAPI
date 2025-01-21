import { Request, Response } from "express";
import userModel, { IUser } from "../models/userModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ObjectId, Document } from "mongoose";

type Token = {
  accessToken: string;
  refreshToken: string;
};

const register = async (req: Request, res: Response) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      email: req.body.email,
      password: hashedPassword,
    });
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

const login = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;

  if (!email || !password) {
    return res.status(400).send({ message: "missing email or password" });
  }
  try {
    const userDB = await userModel.findOne({ email: req.body.email });
    if (!userDB) {
      res.status(401).send({ message: "email or password incorrect" });
      return;
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      userDB.password
    );
    if (!validPassword) {
      res.status(401).send({ message: "email or password incorrect" });
      return;
    }

    const token = generateToken(userDB._id);
    if (!token) {
      res.status(500).send({ message: "internal server error" });
      return;
    }
    if (!userDB.refreshTokens) {
      userDB.refreshTokens = [];
    }
    userDB.refreshTokens.push(token.refreshToken);

    await userDB.save();
    res.status(200).send({
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      _id: userDB._id,
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);
    await user.save();
    res.status(200).send({ message: "logout success" });
  } catch (err) {
    res.status(400).send({ message: "failed to Logout" });
  }
};

const generateToken = (userId: ObjectId): Token | null => {
  if (!process.env.TOKEN_SECRET) {
    return null;
  }

  const random = Math.random().toString();
  const accessToken = jwt.sign(
    {
      _id: userId,
      random: random,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    {
      _id: userId,
      random: random,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  );
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const verifyRefreshToken = (refreshToken: string | undefined) => {
  return new Promise<Document & IUser>((resolve, reject) => {
    if (!refreshToken) {
      reject("fail");
      return;
    }
    if (!process.env.TOKEN_SECRET) {
      reject("fail");
      return;
    }
    jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET,
      async (err: any, payload: any) => {
        if (err) {
          reject("fail");
          return;
        }

        const userId = payload._id;
        try {
          const userDB = await userModel.findById(userId);
          if (!userDB) {
            reject("fail");
            return;
          }
          if (
            !userDB.refreshTokens ||
            !userDB.refreshTokens.includes(refreshToken)
          ) {
            userDB.refreshTokens = [];
            await userDB.save();
            reject("fail");
            return;
          }
          const tokens = userDB.refreshTokens!.filter(
            (token) => token !== refreshToken
          );
          userDB.refreshTokens = tokens;

          resolve(userDB);
        } catch (err) {
          reject("fail");
          return;
        }
      }
    );
  });
};

const refresh = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);

    if (!user._id) return;

    const tokens = generateToken(user._id);

    if (!tokens) {
      res.status(500).send({ message: "internal server error" });
      return;
    }
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id,
    });
  } catch (err) {
    res.status(400).send({ message: err });
  }
};

export default {
  register,
  login,
  refresh,
  logout,
};
