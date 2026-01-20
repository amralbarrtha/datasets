import { db } from "../db/index";
import { users } from "../db/schema";

async function main() {
    console.log("Checking users in database...");
    const allUsers = await db.select().from(users);
    console.log("Found users:", allUsers.map(u => ({ email: u.email, id: u.id })));
    process.exit(0);
}

main().catch(console.error);
