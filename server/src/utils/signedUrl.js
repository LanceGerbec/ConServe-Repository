import jwt from 'jsonwebtoken';

export const generateSignedPdfUrl = (fileId, userId) => {
  const token = jwt.sign(
    { fileId: fileId.toString(), userId: userId.toString(), type: 'pdf-access' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return `/api/research/${fileId}/pdf?token=${token}`;
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