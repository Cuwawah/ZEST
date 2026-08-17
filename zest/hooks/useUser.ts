import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, updateUser as updateUserAction } from "@/app/actions/users";

export const useCurrentUser = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
  });

  return { user: user ?? null, isLoading };
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateUserAction>[0]) => updateUserAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
  });
  return mutation.mutateAsync;
};
