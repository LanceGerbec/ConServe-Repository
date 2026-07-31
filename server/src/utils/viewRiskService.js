import crypto from 'crypto';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';

const WINDOW_MS = 24 * 60 * 60 * 1000;
const LOCK_MS = 60 * 60 * 1000;
const EVENT_WEIGHTS = {
  'Screenshot Attempt Blocked': 45,
  'PrintScreen Blocked': 45,
  'DevTools Detected': 35,
  'Content Protection Activated': 20,
  'Copy Attempt': 10,
  default: 15
};

const hashEvent = (payload) => {
  const secret = process.env.VIEW_AUDIT_HMAC_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('VIEW_AUDIT_HMAC_SECRET or JWT_SECRET is required');
  return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
};

const policyFor = (riskScore) => {
  if (riskScore >= 100) return { level: 'restricted', sessionMinutes: 0, reauthenticate: true };
  if (riskScore >= 60) return { level: 'high', sessionMinutes: 10, reauthenticate: true };
  if (riskScore >= 30) return { level: 'elevated', sessionMinutes: 15, reauthenticate: false };
  return { level: 'normal', sessionMinutes: 30, reauthenticate: false };
};

export const createViewSession = async ({ user, researchId, ipAddress, userAgent }) => {
  const sessionId = crypto.randomUUID();
  const startedAt = new Date();
  const initialHash = hashEvent({ sessionId, userId: String(user._id), researchId: String(researchId), startedAt: startedAt.toISOString() });

  await AuditLog.create({
    user: user._id,
    action: 'VIEW_SESSION_STARTED',
    resource: 'Research',
    resourceId: researchId,
    ipAddress,
    userAgent,
    details: { sessionId, integrity: { previousHash: null, eventHash: initialHash, algorithm: 'HMAC-SHA256' } }
  });

  return { sessionId, startedAt, integrityHash: initialHash };
};

export const recordViewRiskEvent = async ({ user, researchId, sessionId, eventType, severity = 'medium', ipAddress, userAgent, metadata = {} }) => {
  const previous = sessionId
    ? await AuditLog.findOne({ user: user._id, 'details.sessionId': sessionId, action: { $in: ['VIEW_SESSION_STARTED', 'VIEW_RISK_EVENT'] } }).sort({ timestamp: -1 }).lean()
    : null;
  const previousHash = previous?.details?.integrity?.eventHash || null;
  const occurredAt = new Date();
  const weight = EVENT_WEIGHTS[eventType] || EVENT_WEIGHTS.default;
  const eventHash = hashEvent({
    sessionId: sessionId || 'unbound',
    researchId: String(researchId),
    eventType,
    severity,
    weight,
    occurredAt: occurredAt.toISOString(),
    previousHash
  });

  const recentEvents = await AuditLog.find({
    user: user._id,
    action: 'VIEW_RISK_EVENT',
    timestamp: { $gte: new Date(Date.now() - WINDOW_MS) }
  }).select('details.risk.weight').lean();
  const riskScore = recentEvents.reduce((sum, event) => sum + (event.details?.risk?.weight || 0), 0) + weight;
  const policy = policyFor(riskScore);

  const log = await AuditLog.create({
    user: user._id,
    action: 'VIEW_RISK_EVENT',
    resource: 'Research',
    resourceId: researchId,
    ipAddress,
    userAgent,
    details: {
      sessionId: sessionId || null,
      eventType,
      severity,
      metadata,
      risk: { weight, score: riskScore, policyLevel: policy.level, evaluationWindowHours: 24 },
      integrity: { previousHash, eventHash, algorithm: 'HMAC-SHA256' }
    }
  });

  if (policy.level === 'restricted') {
    const restrictedUntil = new Date(Date.now() + LOCK_MS);
    await User.findByIdAndUpdate(user._id, { viewingRestrictedUntil: restrictedUntil });
    return { log, riskScore, policy: { ...policy, restrictedUntil } };
  }

  return { log, riskScore, policy };
};
