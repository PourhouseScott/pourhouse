import { prisma } from "@/config/prisma";
import { UserRepository } from "@/repositories/user/UserRepository";

async function main() {
  const [roleArg, email] = process.argv.slice(2);
  const role = roleArg?.toUpperCase();

  if (!email || (role !== "ADMIN" && role !== "USER")) {
    console.error("Usage: npm run admin:grant -- <email> OR npm run admin:revoke -- <email>");
    process.exitCode = 1;
    return;
  }

  const userRepository = new UserRepository(prisma);
  const updated = await userRepository.updateRoleByEmail({
    email,
    role
  });

  console.log(`Updated role for ${updated.email} to ${updated.role}`);
}

void main()
  .catch((error) => {
    console.error("Failed to update user role", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
