import { isAdmin } from "@/lib/isAdmin";
import prisma from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(StatusCodes.METHOD_NOT_ALLOWED);
    return res.json({ error: `This API doesn't support ${req.method}` });
  }
  try {
    const isAdminUser = await isAdmin(req.body.id);
    if (!isAdminUser) {
      res.status(StatusCodes.BAD_REQUEST);
      return res.json({ error: "Unauthorized!" });
    }
    await prisma.user.updateMany({
      where: {
        hostel_id: req.body.hostelId,
      },
      data: {
        balance: 0,
      },
    });
    await prisma.transaction.deleteMany({
      where: {
        hostel_id: req.body.hostelId,
      },
    });
    res.status(StatusCodes.OK);
    return res.json(true);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ error: "Unable to register user" });
  }
};

export default handler;
