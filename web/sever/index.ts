require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
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
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

io.on("connection", async (socket: Socket) => {
  console.log(`Client connected to socket`);
  try {
    const bins = await getAllBinsFromDatabase();
    const data = JSON.stringify(bins);
    socket.emit("bins-updated", data); // send initial data to the client
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  socket.on("disconnect", () => {
    console.log(`Client disconnected from socket`);
  });
});


const sendUpdatedBinsToClients = (bins: Bin[]) => {
  const data = JSON.stringify(bins);
  io.emit("bins-updated", data);
};

const getAllBinsFromDatabase = async (): Promise<Bin[]> => {
  const ref = admin.database().ref('/bins');
  const snapshot = await ref.once('value');
  const bins: Bin[] = [];

  snapshot.forEach((childSnapshot) => {
    const bin: Bin = {
      id: childSnapshot.key as string,
      ...childSnapshot.val(),
    };
    bins.push(bin);
  });

  return bins;
};

app.get("/api/bins", async (req: Request, res: Response) => {
  try {
    const bins = await getAllBinsFromDatabase();
    res.status(200).json(bins);

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data" });
  }
});

app.post("/api/bins", async (req: Request, res: Response) => {
  try {
    const binData: Bin = req.body;
    await writeDataToDatabase(binData);
    res.status(200).json({ message: "Data saved successfully" });
    // Emit the 'bins-updated' event to all connected clients

    const bins = await getAllBinsFromDatabase();
    sendUpdatedBinsToClients(bins);
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Error saving data" });
  }
});

app.get("/api/socket", async (req: Request, res: Response) => {
  const endpoint = `${process.env.SOCKET_HOST}:${process.env.SOCKET_PORT}`;
  res.json({ endpoint });
});

server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
