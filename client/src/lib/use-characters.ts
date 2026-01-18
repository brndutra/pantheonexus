import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { charactersApi } from "./api";
import type { InsertCharacter } from "@shared/schema";
import { toast } from "sonner";

const QUERY_KEY = ["characters"];

// Helper to convert name to URL-friendly slug
export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Get all characters
export function useCharacters() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: charactersApi.getAll,
  });
}

// Get a single character by ID
export function useCharacter(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => charactersApi.get(id!),
    enabled: !!id,
  });
}

// Create a new character
export function useCreateCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: charactersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Character created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create character");
    },
  });
}

// Update a character
export function useUpdateCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertCharacter> }) =>
      charactersApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, variables.id] });
      toast.success("Character saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update character");
    },
  });
}

// Delete a character
export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: charactersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Character deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete character");
    },
  });
}
