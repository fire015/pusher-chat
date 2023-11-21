import Pusher from "pusher-js";

export default class Chat {
  constructor(chatID, logToConsole = false) {
    Pusher.logToConsole = logToConsole;

    this.chatID = chatID;
    this.pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      channelAuthorization: { endpoint: import.meta.env.VITE_SERVER_AUTH_ENDPOINT },
    });
  }

  subscribe(callback) {
    const channelName = `presence-chat-${this.chatID}`;
    this.channel = this.pusher.subscribe(channelName);
    this.channel.bind("pusher:subscription_succeeded", callback);
    this.channel.bind("pusher:subscription_error", (err) => callback(null, err));
  }

  onMemberAdded(callback) {
    this.channel.bind("pusher:member_added", callback);
  }

  onMemberRemoved(callback) {
    this.channel.bind("pusher:member_removed", callback);
  }

  onMessage(callback) {
    this.channel.bind("client-chatMessage", callback);
  }

  send(message) {
    this.channel.trigger("client-chatMessage", { message, timestamp: String(Date.now()) });
  }

  getUser(userID) {
    return this.channel.members.get(userID).info;
  }
}
