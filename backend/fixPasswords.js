const bcrypt = require("bcrypt");
const pool = require("./db");

async function fixPasswords() {
  try {
    const result = await pool.query(
      "SELECT id, email, password FROM users"
    );

    console.log(`Found ${result.rows.length} users`);

    for (const user of result.rows) {

      // Skip passwords that are already hashed
      if (
        user.password &&
        (
          user.password.startsWith("$2a$") ||
          user.password.startsWith("$2b$") ||
          user.password.startsWith("$2y$")
        )
      ) {
        console.log(`Already hashed: ${user.email}`);
        continue;
      }

      if (!user.password) {
        console.log(`No password: ${user.email}`);
        continue;
      }

      // Hash existing plain-text password
      const hashedPassword = await bcrypt.hash(
        user.password,
        10
      );

      // Update database
      await pool.query(
        `
        UPDATE users
        SET password = $1
        WHERE id = $2
        `,
        [
          hashedPassword,
          user.id
        ]
      );

      console.log(`Password converted: ${user.email}`);
    }

    console.log("");
    console.log("=================================");
    console.log("ALL PASSWORDS FIXED SUCCESSFULLY");
    console.log("=================================");

  } catch (error) {
    console.error("PASSWORD MIGRATION ERROR:", error);
  } finally {
    await pool.end();
  }
}

fixPasswords();