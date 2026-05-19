export interface Turn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sourceDocIds?: string[];
}

export interface Session {
  id: string;
  turns: Turn[];
  createdAt: string;
  lastActivity: string;
}

const MAX_TURNS = 10;
const sessions = new Map<string, Session>();

export function getOrCreateSession(sessionId: string): Session {
  const existing = sessions.get(sessionId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const created: Session = {
    id: sessionId,
    turns: [],
    createdAt: now,
    lastActivity: now,
  };
  sessions.set(sessionId, created);
  return created;
}

export function addTurn(sessionId: string, turn: Turn): void {
  const session = getOrCreateSession(sessionId);
  session.turns.push(turn);
  session.lastActivity = new Date().toISOString();

  if (session.turns.length > MAX_TURNS) {
    session.turns = session.turns.slice(-MAX_TURNS);
  }
}

export function getHistory(sessionId: string): Turn[] {
  return sessions.get(sessionId)?.turns ?? [];
}
