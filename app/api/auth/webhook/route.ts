import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import dbConnect from "@/lib/database";
import User from "@/models/User";
import Reader from "@/models/Reader";

export async function POST(req: Request) {
  // Get the webhook signature from the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook signature
  // This will throw an error if the signature is invalid
  let evt: WebhookEvent;

  try {
    evt = await verify(body, {
      svix_id,
      svix_timestamp,
      svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  await dbConnect();

  if (eventType === "session.created") {
    // User signed in - set reader isOnline to true if they're a reader
    try {
      const user = await User.findOne({ clerkId: evt.data.user_id });
      if (user && user.role === 'reader') {
        await Reader.findOneAndUpdate(
          { userId: evt.data.user_id },
          { 
            isOnline: true,
            lastActive: new Date()
          }
        );
      }
    } catch (error) {
      console.error('Error updating reader online status on sign in:', error);
    }
  }

  if (eventType === "session.ended") {
    // User signed out - set reader isOnline to false if they're a reader
    try {
      const user = await User.findOne({ clerkId: evt.data.user_id });
      if (user && user.role === 'reader') {
        await Reader.findOneAndUpdate(
          { userId: evt.data.user_id },
          { 
            isOnline: false,
            lastActive: new Date()
          }
        );
      }
    } catch (error) {
      console.error('Error updating reader online status on sign out:', error);
    }
  }

  if (eventType === "user.created") {
    // Create the user in your database
    // await createUser(evt.data);
  }

  if (eventType === "user.updated") {
    // Update the user in your database
    // await updateUser(evt.data);
  }

  if (eventType === "user.deleted") {
    // Delete the user from your database
    // await deleteUser(evt.data);
  }

  return NextResponse.json({ success: true });
}

interface WebhookHeaders {
  svix_id: string;
  svix_timestamp: string;
  svix_signature: string;
}

async function verify(payload: string, { svix_id, svix_timestamp, svix_signature }: WebhookHeaders): Promise<WebhookEvent> {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('WEBHOOK_SECRET is not set');
  }

  const webhook = new Webhook(webhookSecret);
  const headers = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  };

  // Verify the payload with the headers
  return webhook.verify(payload, headers) as WebhookEvent;
}
