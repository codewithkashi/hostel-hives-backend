import { hashPassword } from "@/lib/passwordHelper";
import prisma from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(StatusCodes.METHOD_NOT_ALLOWED);
    return res.json({ error: `This API doesn't support ${req.method}` });
  }
  const { hostel_id, name, email, password, hostel_action } = req.body;
  const hashedPassword = await hashPassword(password);
  let hostel;

  const existingEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingEmail) {
    res.status(StatusCodes.BAD_REQUEST);
    return res.json({ error: "Email already exists" });
  }
  if (hostel_action === "join" && hostel_id) {
    const existingHostel = await prisma.hostel.findUnique({
      where: {
        id: hostel_id,
      },
    });
    if (!existingHostel) {
      res.status(StatusCodes.NOT_FOUND);
      return res.json({ error: "Invalid hostel ID" });
    }
  }
  if (hostel_action === "create") {
    hostel = await prisma.hostel.create({
      data: {},
    });

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        hostel_id: hostel.id,
        is_admin: true,
        status: "A",
      },
    });

    await prisma.hostel.update({
      where: {
        id: hostel.id,
      },
      data: {
        users: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    res.status(StatusCodes.OK);
    return res.json({ message: "Admin account created!", hostel: hostel.id });
  } else if (hostel_action === "join" && hostel_id) {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        hostel_id,
        status: "P",
      },
    });

    await prisma.hostel.update({
      where: {
        id: hostel_id,
      },
      data: {
        users: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    res.status(StatusCodes.OK);
    return res.json({
      message: "Account created! Waiting for approval from hostel Admin",
    });
  }

  try {
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ error: "Unable to register user" });
  }
};

export default handler;
