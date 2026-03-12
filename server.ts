import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-conversation", (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on("leave-conversation", (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on(
      "send-message",
      (data: {
        conversationId: string;
        message: {
          id: string;
          content: string;
          senderId: string;
          createdAt: string;
          sender: { name: string; image: string | null };
        };
      }) => {
        socket.to(data.conversationId).emit("new-message", data.message);
      }
    );

    socket.on("typing", (data: { conversationId: string; userId: string }) => {
      socket.to(data.conversationId).emit("user-typing", data.userId);
    });

    socket.on(
      "stop-typing",
      (data: { conversationId: string; userId: string }) => {
        socket
          .to(data.conversationId)
          .emit("user-stop-typing", data.userId);
      }
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
