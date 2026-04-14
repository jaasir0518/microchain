import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    trustScore?: number;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      trustScore?: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    trustScore?: number;
  }
}
