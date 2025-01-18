const WebSocket = require("ws");
const axios = require("axios");
const express = require('express');
const path = require('path');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/', async(req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/recipe', async(req, res) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/gemma-2-2b-it/v1/chat/completions",
      {
        model: "google/gemma-2-2b-it",
        messages: [{ role: "user", content: req.body.prompt }],
        max_tokens: 500,
        stream: false
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.HUGGING_FACE_SECRET}`,
          "Content-Type": "application/json",
      },
      }
    );
console.log(response)
    // Send OpenAI's response back to the client
    const reply = response.data.choices[0].message.content;
    res.json({
      recipe: reply
    })
  } catch (error) {
    console.error("Error communicating with LLM API:", error.message);
    res.json({
      message: "Error communicating with LLM API."
    })
  }
})

app.listen(5010, () => {
  console.log("Server successfully running on port 5010");
});

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (clientSocket) => {
  console.log("Client connected");

  clientSocket.on("message", async (message) => {
    console.log("Message from client:", message);
    // Forward the message to OpenAI API
   
  });

  clientSocket.on("close", () => {
    console.log("Client disconnected");
  });
});
