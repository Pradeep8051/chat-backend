import "dotenv/config";
import { firestore } from "./config/firebase";

async function testFirebaseConnection(): Promise<void> {
  try {
    const testRef = firestore
      .collection("_connection_test")
      .doc("connection");
    await testRef.set({
      message: "Firebase connection successful",
      createdAt: new Date(),
    });

    console.log("Firebase write successful!");
    const snapshot = await testRef.get();

    if (snapshot.exists) {
      console.log("Firebase read successful!");
      console.log("Document data:", snapshot.data());
    }
    await testRef.delete();

    console.log("Firebase connection verified successfully!");
  } catch (error) {
    console.error("Firebase connection failed:", error);
    process.exitCode = 1;
  }
}

testFirebaseConnection();