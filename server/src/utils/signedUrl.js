import jwt from 'jsonwebtoken';

export const generateSignedPdfUrl = (fileId, userId) => {
  const payload = {
    fileId: fileId.toString(),
    userId: userId.toString(),
    type: 'pdf-access',
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return `/research/view/${fileId}?token=${token}`;
};

export const verifySignedUrl = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'pdf-access') throw new Error('Invalid token type');
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};