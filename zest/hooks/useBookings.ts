import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUpcomingBookings,
  getBookingWithResponses,
  cancelBooking as cancelBookingAction,
  updateBookingNotes as updateNotesAction,
} from "@/app/actions/bookings";
import { useCurrentUser } from "./useUser";

export const useUpcomingBookings = () => {
  const { user } = useCurrentUser();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", "upcoming"],
    queryFn: () => getUpcomingBookings(),
    enabled: !!user,
  });

  return { bookings, isLoading };
};

export const useBooking = (id?: string) => {
  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => (id ? getBookingWithResponses(id) : null),
    enabled: !!id,
  });

  return { booking, isLoading };
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => cancelBookingAction(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
  return mutation.mutateAsync;
};

export const useUpdateBookingNotes = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      updateNotesAction(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
  });
  return mutation.mutateAsync;
};
