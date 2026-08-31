export interface VisitTimeSlot {
  startsAt: string;
  available: boolean;
}

export interface VisitDateOption {
  date: string;
  slots: VisitTimeSlot[];
}

export interface VisitRequestFormState {
  selectedVisitTimes: string[];
}
