import Pusher from 'pusher';
import PusherJs from 'pusher-js';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export const pusherClient = new PusherJs(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);

export const pusherConfig = {
  channelPrefix: 'user-',
  events: {
    notification: 'notification',
    message: 'message',
    typing: 'typing',
  },
};
