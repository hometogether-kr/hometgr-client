export const reservationQueryKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationQueryKeys.all, "list"] as const,
  mine: () => [...reservationQueryKeys.lists(), "mine"] as const,
  details: () => [...reservationQueryKeys.all, "detail"] as const,
  detail: (reservationId: string) => [...reservationQueryKeys.details(), reservationId] as const,
  hostDetails: () => [...reservationQueryKeys.all, "host-detail"] as const,
  hostDetail: (reservationId: string) =>
    [...reservationQueryKeys.hostDetails(), reservationId] as const,
};
