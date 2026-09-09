export interface User {
  id: string;
  name: string;
  avatar: string;
  interests: string[];
}

export interface OrbitRingData {
  ring: number;
  userIds: string[];
}

export interface Signal {
  id: string;
  userId: string;
  text: string;
  ring: number;
}

export interface Spark {
  id: string;
  authorId: string;
  text: string;
  topic: string;
  createdAt: string;
  liveAttention: number;
  orbitRings: OrbitRingData[];
  signals: Signal[];
}

export interface Constellation {
  id: string;
  name: string;
  gravity: number;
}

export interface UserConnection {
  userId: string;
  closeness: number;
  trend: 'growing' | 'fading';
}

export interface MockData {
  users: User[];
  sparks: Spark[];
  constellations: Constellation[];
  userConnections: UserConnection[];
}
