import { memo } from "react";

const OutgoingMessage = memo(function OutgoingMessage({ message }) {
  return (
    <div className="outgoing_msg">
      <div className="sent_msg">
        <p>{message}</p>
        <span className="time_date">Me</span>
      </div>
    </div>
  );
});

export default OutgoingMessage;
