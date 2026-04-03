export async function legacyChat(req, res) {
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  const prefix = message ? `You said: "${message}". ` : '';

  return res.status(200).json({
    reply:
      `${prefix}The backend is running. This project now exposes authentication APIs at ` +
      `/api/auth/register, /api/auth/login, and /api/profile. ` +
      `The current frontend chat screen is still wired to the old /chat endpoint.`,
  });
}
