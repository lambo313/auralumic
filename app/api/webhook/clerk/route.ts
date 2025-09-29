import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import connectDB from '@/lib/database';
import User from '@/models/User';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    await connectDB();

    switch (eventType) {
      case 'user.created': {
        const userData = evt.data;
        
        const newUser = new User({
          clerkId: userData.id,
          email: userData.email_addresses?.[0]?.email_address,
          role: 'client', // Default role
          credits: 0,
          preferences: {
            theme: 'auto',
            notifications: {
              email: true,
              push: true,
              inApp: true,
            }
          }
        });

        await newUser.save();
        return new Response('User created', { status: 201 });
      }

      case 'user.updated': {
        const userData = evt.data;
        
        await User.findOneAndUpdate(
          { clerkId: userData.id },
          {
            email: userData.email_addresses?.[0]?.email_address,
            // Add any other fields you want to keep in sync
          }
        );
        return new Response('User updated', { status: 200 });
      }

      case 'user.deleted': {
        const { id } = evt.data;
        await User.findOneAndDelete({ clerkId: id });
        return new Response('User deleted', { status: 200 });
      }

      case 'session.created': {
        // You can track user sign-ins here if needed
        const { user_id } = evt.data;
        // Example: Update last login timestamp
        await User.findOneAndUpdate(
          { clerkId: user_id },
          { lastLoginAt: new Date() }
        );
        return new Response('Session created', { status: 200 });
      }

      case 'session.ended': {
        // You can track user sign-outs here if needed
        return new Response('Session ended', { status: 200 });
      }

      case 'email.created': {
        const email = evt.data;
        console.log('Email webhook data:', email); // For debugging the structure
        if ('email_address' in email) {
          await User.findOneAndUpdate(
            { clerkId: email.user_id },
            { email: email.email_address }
          );
        }
        return new Response('Email created', { status: 200 });
      }

      default:
        // Handle any other webhook events
        return new Response('Webhook received', { status: 200 });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
