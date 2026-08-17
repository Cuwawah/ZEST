import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyEventTypes,
  getEventTypeById,
  createEventType as createEventTypeAction,
  updateEventType as updateEventTypeAction,
  updateEventTypeFull as updateEventTypeFullAction,
  deleteEventType as deleteEventTypeAction,
} from "@/app/actions/eventTypes";

export const useEventTypes = () => {
  const queryClient = useQueryClient();
  const { data: eventTypes, isLoading } = useQuery({
    queryKey: ["eventTypes"],
    queryFn: () => getMyEventTypes(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createEventTypeAction>[0]) =>
      createEventTypeAction(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (args: {
      id: string;
      name?: string;
      description?: string;
      duration?: number;
      slug?: string;
      isActive?: boolean;
    }) => {
      const { id, ...data } = args;
      return updateEventTypeAction(id, data);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] }).then(() =>
        queryClient.invalidateQueries({ queryKey: ["eventType", variables.id] })
      ),
  });

  const updateFullMutation = useMutation({
    mutationFn: (args: {
      id: string;
      name?: string;
      description?: string;
      duration?: number;
      slug?: string;
      isActive?: boolean;
      capacity?: number;
      reminderHours?: number;
      availability?: Parameters<typeof createEventTypeAction>[0]["availability"];
      questions?: Parameters<typeof createEventTypeAction>[0]["questions"];
    }) => {
      const { id, ...data } = args;
      return updateEventTypeFullAction(id, data);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] }).then(() =>
        queryClient.invalidateQueries({ queryKey: ["eventType", variables.id] })
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEventTypeAction(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] }),
  });

  return {
    eventTypes,
    createEventType: createMutation.mutateAsync,
    updateEventType: updateMutation.mutateAsync,
    updateEventTypeFull: updateFullMutation.mutateAsync,
    deleteEventType: deleteMutation.mutateAsync,
    isLoading,
  };
};

export const useEventType = (id?: string) => {
  const { data: eventType, isLoading } = useQuery({
    queryKey: ["eventType", id],
    queryFn: () => (id ? getEventTypeById(id) : null),
    enabled: !!id,
  });

  return { eventType, isLoading };
};
