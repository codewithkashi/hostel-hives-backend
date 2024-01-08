import prisma from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(StatusCodes.METHOD_NOT_ALLOWED);
    return res.json({ error: `This API doesn't support ${req.method}` });
  }
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        hostel_id: req.body.hostelId,
      },
      include: {
        trasnaction_user_detials: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    res.status(StatusCodes.OK);
    return res.json(transactions);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ error: "Unable to register user" });
  }
};

export default handler;
