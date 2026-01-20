import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Seeding database...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10); // Password for normal user

    // Seed Admin
    const existingAdmin = await db.query.users.findFirst({
        where: eq(users.email, "admin@example.com"),
    });

    if (!existingAdmin) {
        await db.insert(users).values({
            email: "admin@example.com",
            password: adminPassword,
        });
        console.log("Admin user created");
    } else {
        console.log("Admin user already exists");
    }

    // Seed Normal User
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, "user@example.com"),
    });

    if (!existingUser) {
        await db.insert(users).values({
            email: "user@example.com",
            password: userPassword,
        });
        console.log("Normal user created");
    } else {
        console.log("Normal user already exists");
    }

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
