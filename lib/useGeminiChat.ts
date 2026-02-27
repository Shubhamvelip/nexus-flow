'use client';

import { useState, useCallback } from 'react';
import { GeminiResponse, GeminiMessage } from './types';

interface UseGeminiChatOptions {
  policyId: string;
  apiKey?: string;
}

export function useGeminiChat({ policyId, apiKey }: UseGeminiChatOptions) {
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userQuery: string): Promise<GeminiResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        // For now, return mock response structure
        // This will be replaced with actual Gemini API call
        const mockResponse: GeminiMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Based on the policy "${policyId}", here's my analysis: ${userQuery}. This is a mock response. When connected to Gemini API, you'll get AI-powered insights about your policies.`,
          timestamp: new Date(),
        };

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() - 1}`,
            role: 'user',
            content: userQuery,
            timestamp: new Date(Date.now() - 1000),
          },
          mockResponse,
        ]);

        return {
          success: true,
          message: mockResponse,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return {
          success: false,
          message: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
          },
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [policyId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
