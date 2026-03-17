import type { Request, Response } from "express";
import { AuthService } from "@/services/authService";

export class AuthController {
  public constructor(private readonly authService: AuthService) { }

  public register = async (req: Request, res: Response) => {
    const result = await this.authService.registerUser(req.body);
    res.status(201).json(result);
  };

  public login = async (req: Request, res: Response) => {
    const result = await this.authService.loginUser(req.body);
    res.status(200).json(result);
  };
}
