import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { Bin } from "./types";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

const serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://iot-project-643b6-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const writeDataToDatabase = async (binData: Bin) => {
  const ref = admin.database().ref("/bins");
  await ref.child(binData.id).set(binData);
  console.log(`Data for bin ${binData.id} saved successfully.`);
};

const app = express();

app.use(express.json());

const server = http.createServer(app);
const io = new SocketIOServer(server);

io.on("connection", (socket: Socket) => {
  console.log(`Client connected to socket`);
  socket.on("disconnect", () => {
    console.log(`Client disconnected from socket`);
  });
});

const sendUpdatedBinsToClients = (bins: Bin[]) => {
  const data = JSON.stringify(bins);
  io.emit("bins-updated", data);
};

app.get("/bins", async (req: Request, res: Response) => {
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

        // Send the updated data to the client via socket
        sendUpdatedBinsToClients(bins);
      }
    });

    res.status(200).json(bins);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data" });
  }
});

app.post("/bins", async (req: Request, res: Response) => {
  try {
    const binData: Bin = req.body;
    await writeDataToDatabase(binData);
    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Error saving data" });
  }
});

app.all("*", (req: Request, res: Response) => {
  res.status(405).json({ message: "Method not allowed" });
});

server.listen(3030, () => {
  console.log("Server is listening on port 3000");
});
