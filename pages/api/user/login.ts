import { verifyPassword } from "@/lib/passwordHelper";
import prisma from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(StatusCodes.METHOD_NOT_ALLOWED);
    return res.json({ error: `This API doesn't support ${req.method}` });
  }

  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      return res.json({
        error: "Can't find account associated with this Email",
      });
    }
    const matched = await verifyPassword(password, user.password);
    if (!matched) {
      res.status(StatusCodes.BAD_REQUEST);
      return res.json({ error: "Wrong password" });
    }

    if (user.status === "P") {
      res.status(StatusCodes.BAD_REQUEST);
      return res.json({ error: "Your account is still pending for approval!" });
    }

    if (user.status === "B") {
      res.status(StatusCodes.BAD_REQUEST);
      return res.json({ error: "Your account has been blocked" });
    }
    if (user.status === "R") {
      res.status(StatusCodes.BAD_REQUEST);
      return res.json({ error: "Your account has been rejected by Admin!" });
    }
    if (user.status === "A") {
      res.status(StatusCodes.OK);
      return res.json(user);
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ error: "Unable to register user" });
  }
};
export default handler;
