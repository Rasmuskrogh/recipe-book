import { useState, useCallback } from "react";

export function useFriends() {
  const [friends, _setFriends] = useState<unknown[]>([]);
  const [requests, _setRequests] = useState<unknown[]>([]);
  const [isLoading, _setIsLoading] = useState(false);

  const sendRequest = useCallback(async (_userId: string) => {
    // Placeholder
  }, []);

  const acceptRequest = useCallback(async (_requestId: string) => {
    // Placeholder
  }, []);

  const rejectRequest = useCallback(async (_requestId: string) => {
    // Placeholder
  }, []);

  return {
    friends,
    requests,
    isLoading,
    sendRequest,
    acceptRequest,
    rejectRequest,
  };
}
