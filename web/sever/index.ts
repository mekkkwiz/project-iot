require("dotenv").config();
import express, { Request, Response } from "express";
import admin from "firebase-admin";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Bin, DBbin } from "./types";
import cors from 'cors';

const serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const writeDataToDatabase = async (binData: Bin) => {
  const binsRef = db.collection("bins");
  const binRef = binsRef.doc(binData.id);
  const currentData = (await binRef.get()).data();
  const currentStatus = currentData?.status || [];
  const updatedStatus = [
    ...currentStatus,
    {
      time: new Date().toISOString(),
      isFull: binData.status === "full",
    },
  ];
  await binRef.set({ ...binData, status: updatedStatus });
  console.log(`Data for bin ${binData.id} saved successfully.`);
};


const app = express();

app.use(cors());
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

const sendUpdatedBinsToClients = (bins: DBbin[]) => {
  const data = JSON.stringify(bins);
  io.emit("bins-updated", data);
};

const getAllBinsFromDatabase = async (): Promise<DBbin[]> => {
  const binsRef = db.collection("bins");
  const snapshot = await binsRef.get();
  const bins: DBbin[] = [];

  snapshot.forEach((doc) => {
    const dbBin = doc.data() as DBbin;
    const bin: DBbin = {
      id: doc.id,
      location: dbBin.location,
      status: dbBin.status,
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
