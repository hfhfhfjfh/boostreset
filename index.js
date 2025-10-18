import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://starx-network-default-rtdb.firebaseio.com"
});

const db = admin.database();

async function resetBoosts() {
  const usersRef = db.ref("/");
  const snapshot = await usersRef.once("value");

  if (!snapshot.exists()) {
    console.log("⚠️ No users found.");
    return;
  }

  const updates = {};
  let count = 0;

  snapshot.forEach(child => {
    const userId = child.key;
    const data = child.val();

    if (data.boostRate && data.boostRate > 0) {
      updates[`${userId}/boostRate`] = 0;
      updates[`${userId}/boostTimestamp`] = 0;
      count++;
    }
  });

  if (count === 0) {
    console.log("✅ No boosted users to reset today.");
    return;
  }

  await usersRef.update(updates);
  console.log(`✅ Successfully reset boost data for ${count} users.`);
}

resetBoosts()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Error resetting boosts:", err);
    process.exit(1);
  });
