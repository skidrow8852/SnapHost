import { useEffect, useState } from 'react';
export function useSession() {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

      try {
        const token = localStorage.getItem("bearer_token") ?? undefined;
        setToken(token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setToken(undefined);
      } finally {
        setIsLoading(false);
      }

  }, []);

  return { token, isLoading };
}