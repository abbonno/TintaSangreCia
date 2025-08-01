export const prerender = false;

/** @type {import('astro').APIRoute} */
export async function POST({ request }) {
  const body = await request.text();
  const params = new URLSearchParams(body);

  const email = params.get('email');
  const password = params.get('password');

  const defaultUser = {
    email: 'test@demo.com',
    password: '123456',
  };

  if (email === defaultUser.email && password === defaultUser.password) {
    return Response.redirect(new URL('/login-success', request.url), 302);
  } else {
    return Response.redirect(new URL('/login-error', request.url), 302);
  }
}
