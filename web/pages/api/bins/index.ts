import { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import { Bin } from "../../../types"
const serviceAccount = require('../../../firebase-adminsdk.json');

import mockData from "../data.json"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://iot-project-643b6-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const writeDataToDatabase = async (binData: Bin) => {
  const ref = admin.database().ref("/bins");
  await ref.child(binData.id).set(binData);
  console.log(`Data for bin ${binData.id} saved successfully.`);
};

export default async function webhook(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const ref = admin.database().ref("/bins");

      // Convert the Firebase snapshot to an array of Bin objects
      const bins: Bin[] = [];
      const snapshot = await ref.once("value");
      snapshot.forEach((childSnapshot) => {
        const bin: Bin = {
          id: childSnapshot.key as string,
          ...childSnapshot.val(),
        };
        bins.push(bin);
      });

      // Attach a listener to the reference to get data in real-time
      ref.on("child_changed", (childSnapshot) => {
        const updatedBin: Bin = {
          id: childSnapshot.key as string,
          ...childSnapshot.val(),
        };
        const index = bins.findIndex((bin) => bin.id === updatedBin.id);
        if (index !== -1) {
          // Update the existing bin object in the array
          bins[index] = updatedBin;

          // Send the updated data to the client
          res.json(bins);
        }
      });

      res.status(200).json(bins);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Error fetching data" });
    }
  } else if (req.method === "POST") {
    try {
      const binData: Bin = req.body;
      await writeDataToDatabase(binData);
      res.status(200).json({ message: "Data saved successfully" });
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).json({ message: "Error saving data" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
