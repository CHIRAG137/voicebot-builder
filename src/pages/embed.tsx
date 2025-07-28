import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function EmbedChat() {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get("botId");
  const [messages, setMessages] = useState<{ from: "user" | "bot", text: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim() || !botId) return;

    const userMessage = { from: "user", text: input };
    // setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post("http://localhost:5000/api/bots/ask", {
        botId,
        question: input,
      });
      const botMessage = { from: "bot", text: res.data.answer };
      // setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, { from: "bot", text: "Error getting answer." }]);
    }

    setInput("");
  };

  return (
    <div style={{ fontFamily: "sans-serif", height: "100%", padding: 10 }}>
      <div style={{ height: 440, overflowY: "auto", background: "#f9f9f9", padding: 10, borderRadius: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.from === "user" ? "right" : "left", marginBottom: 8 }}>
            <span
              style={{
                display: "inline-block",
                padding: "6px 12px",
                background: msg.from === "user" ? "#007bff" : "#e5e5e5",
                color: msg.from === "user" ? "#fff" : "#000",
                borderRadius: "16px",
                maxWidth: "80%",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, display: "flex" }}>
        <input
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
        />
        <button
          style={{ marginLeft: 8, padding: "8px 16px", borderRadius: 6, background: "#007bff", color: "#fff", border: "none" }}
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}