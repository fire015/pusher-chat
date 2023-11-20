export default function IncomingMessage({ message, name }) {
  return (
    <div className="incoming_msg">
      <div className="incoming_msg_img">
        <img src="/user-profile.png" alt="" />
      </div>
      <div className="received_msg">
        <div className="received_withd_msg">
          <p>{message}</p>
          <span className="time_date">{name}</span>
        </div>
      </div>
    </div>
  );
}
