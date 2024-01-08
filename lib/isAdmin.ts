import prisma from "./prisma";

export const isAdmin = async (id: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!user) {
      return null;
    }
    if (!user.is_admin) {
      return null;
    }

    return user;
  } catch (error) {
    console.log(error);
  }
};
