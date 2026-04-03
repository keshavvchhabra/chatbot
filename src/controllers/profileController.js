export async function getProfile(req, res) {
  return res.status(200).json({
    user: req.user,
  });
}
