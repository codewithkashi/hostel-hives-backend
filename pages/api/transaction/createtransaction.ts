import prisma from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(StatusCodes.METHOD_NOT_ALLOWED);
    return res.json({ error: `This API doesn't support ${req.method}` });
  }
  const { id, amount, hostel_id, transaction_by, included_users, items } =
    req.body;
  try {
    const includedUsers = included_users.filter((tu: number) => tu !== id);

    const trnasaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        hostel_id,
        transaction_by: parseInt(transaction_by),
        included_users,
        per_head: amount / included_users.length,
        items,
      },
    });

    const deducted = await prisma.user.updateMany({
      where: {
        id: {
          in: includedUsers,
        },
      },
      data: {
        balance: {
          decrement: trnasaction.per_head,
        },
      },
    });
    console.log(deducted, "deducted");
    const incremented = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        balance: {
          increment: amount - trnasaction.per_head,
        },
      },
    });
    res.status(StatusCodes.OK);
    return res.json(true);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ error: "Unable to register user" });
  }
};

export default handler;
