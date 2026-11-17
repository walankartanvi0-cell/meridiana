import { Notification, type NotificationType } from "../models/Notification";

type NotifyInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
};

/** Small helper so controllers can create in-app notifications consistently. */
export async function notify(input: NotifyInput): Promise<void> {
  await Notification.create({
    user: input.userId,
    title: input.title,
    message: input.message,
    type: input.type ?? "system",
    link: input.link,
  });
}
