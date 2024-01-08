import bcrypt from "bcrypt";
export async function hashPassword(password: string) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}
