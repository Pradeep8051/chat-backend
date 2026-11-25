
import "dotenv/config";

import {prisma} from "./config/database";
import { firestore } from "./config/firebase";

async function testDatabases(): Promise<void> {
  try {
    // 1. PostgreSQL connection
    console.log("\nTesting PostgreSQL...");

    await prisma.$connect();

    const postgresResult = await prisma.$queryRaw<
      Array<{ result: number }>
    >`SELECT 1 AS result`;

    console.log("PostgreSQL connected successfully!");
    console.log("PostgreSQL query result:", postgresResult);

    // 2. Firebase connection
    console.log("\nTesting Firebase Firestore...");

    const testRef = firestore
      .collection("_connection_test")
      .doc("combined-test");

    await testRef.set({
      message: "Both databases are working",
      createdAt: new Date(),
      status: "success",
    });

    console.log("Firebase write successful!");

    const snapshot = await testRef.get();

    if (!snapshot.exists) {
      throw new Error("Firebase test document was not found");
    }

    console.log("Firebase read successful!");
    console.log("Firebase data:", snapshot.data());

    await testRef.delete();

    console.log("Firebase test document deleted!");

    console.log("\nBoth databases are working successfully!");

  } catch (error) {
    console.error("\nDatabase connection test failed:", error);
    process.exitCode = 1;

  } finally {
    await prisma.$disconnect();
  }
}

testDatabases();
