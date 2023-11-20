import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Chat from "./Chat.js";
import IncomingMessage from "./components/IncomingMessage.jsx";
import Member from "./components/Member.jsx";
import OutgoingMessage from "./components/OutgoingMessage.jsx";

export default function App() {
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState();
  const messageHistory = useRef();
  const chat = useMemo(() => new Chat(123, false), []);

  const sendMessage = (e) => {
    e.preventDefault();
    const { msg } = e.target;
    const { value } = msg;

    if (value == "") {
      return;
    }

    chat.send(value);
    setMessages((msgs) => [...msgs, { type: "outgoing", message: value }]);

    msg.value = "";
    msg.focus();
  };

  useEffect(() => {
    chat.subscribe((data, err) => {
      if (err) {
        setError(err.error);
        return;
      }

      const members = [];

      for (let id in data.members) {
        members.push({ id, name: data.members[id].name, primary: id == data.myID });
      }

      setMembers(members);
    });

    chat.onMessage((data, metadata) => {
      const { message } = data;
      const { user_id } = metadata;
      const { name } = chat.getUser(user_id);

      setMessages((msgs) => [...msgs, { type: "incoming", message, name }]);
    });

    chat.onMemberAdded((data) => {
      setMembers((mbrs) => [...mbrs, { id: data.id, name: data.info.name, primary: false }]);
    });

    chat.onMemberRemoved((data) => {
      setMembers((mbrs) => mbrs.filter((m) => m.id != data.id));
    });
  }, [chat]);

  useEffect(() => {
    if (messages.length > 0) {
      messageHistory.current.scrollTo(0, messageHistory.current.scrollHeight);
    }
  }, [messages]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-2">
      <h1>Chat Example</h1>
      <p>
        Members:{" "}
        {members.map((m, key) => (
          <Member key={key} name={m.name} primary={m.primary} />
        ))}
      </p>

      <div className="inbox_msg">
        <div className="mesgs">
          <div className="msg_history" ref={messageHistory}>
            {messages.map((m, key) => {
              return m.type == "incoming" ? (
                <IncomingMessage key={key} message={m.message} name={m.name} />
              ) : (
                <OutgoingMessage key={key} message={m.message} />
              );
            })}
          </div>
          <div className="type_msg">
            <form className="input_msg_write" onSubmit={sendMessage}>
              <input type="text" name="msg" autoComplete="off" className="write_msg" placeholder="Type a message" />
              <button type="submit" className="btn btn-primary msg_send_btn">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
