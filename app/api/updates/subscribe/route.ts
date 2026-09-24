import { NextResponse } from 'next/server';

const BUTTONDOWN_SUBSCRIBERS_URL = 'https://api.buttondown.com/v1/subscribers';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const consent = payload.consent === true;

  if (!consent || !email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ message: 'Enter a valid email address and confirm consent.' }, { status: 400 });
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: 'Email updates are temporarily unavailable while subscription delivery is being configured.' },
      { status: 503 }
    );
  }

  try {
    const providerResponse = await fetch(BUTTONDOWN_SUBSCRIBERS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Buttondown-Collision-Behavior': 'add',
      },
      body: JSON.stringify({
        email_address: email,
        type: 'unactivated',
      }),
      cache: 'no-store',
    });

    if (providerResponse.ok || providerResponse.status === 409) {
      return NextResponse.json(
        { message: 'Check your inbox to confirm your subscription.' },
        { status: 202 }
      );
    }

    return NextResponse.json(
      { message: 'We could not start the subscription. Please try again later.' },
      { status: 502 }
    );
  } catch {
    return NextResponse.json(
      { message: 'We could not start the subscription. Please try again later.' },
      { status: 502 }
    );
  }
}
