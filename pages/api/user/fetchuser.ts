import prisma from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(StatusCodes.METHOD_NOT_ALLOWED);
    return res.json({ error: `This API doesn't support ${req.method}` });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(req.body.id),
      },
    });

    if (!user) {
      res.status(StatusCodes.NOT_FOUND);
      return res.json({ error: "Invalid user ID" });
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
    res.status(StatusCodes.OK);
    return res.json(user);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ error: "Unable to register user" });
  }
};

export default handler;
