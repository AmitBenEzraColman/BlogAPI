import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middlewares/authMiddleware";

jest.mock("jsonwebtoken");

describe("Auth Middleware Tests", () => {
  let req: Request;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      header: jest.fn(),
      params: {},  // Ensure params is defined as an empty object
    } as unknown as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
    process.env.TOKEN_SECRET = "testsecret";
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.TOKEN_SECRET;
  });

  test("Test TOKEN_SECRET not provided", () => {
    req.header = jest.fn().mockReturnValue("Bearer someToken");
    delete process.env.TOKEN_SECRET;

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    expect(next).not.toHaveBeenCalled();
  });

  test("Test token missing in request header", () => {
    req.header = jest.fn().mockReturnValue(null);

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("Test invalid token", () => {
    req.header = jest.fn().mockReturnValue("Bearer invalidToken");

    (jwt.verify as jest.Mock).mockImplementation(
      (token: string, secret: string, callback: (error: Error | null, decoded: any) => void) => {
        callback(new Error("Invalid token"), null);
      }
    );

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Unauthorized");
    expect(next).not.toHaveBeenCalled();
  });

  test("Test valid token", () => {
    req.header = jest.fn().mockReturnValue("Bearer validToken");

    (jwt.verify as jest.Mock).mockImplementation(
      (token: string, secret: string, callback: (error: Error | null, decoded: any) => void) => {
        callback(null, { _id: "user123" });
      }
    );

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(req.params.userId).toBe("user123");
    expect(next).toHaveBeenCalled();
  });
});
