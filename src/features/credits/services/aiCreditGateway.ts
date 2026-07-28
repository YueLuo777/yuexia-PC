export type AiCreditOperation = 'work-profile-optimization';

export type AiCreditReservationRequest = {
  operation: AiCreditOperation;
  resourceId: string;
  quantity: number;
  idempotencyKey: string;
};

export type AiCreditReservation = {
  reservationId: string | null;
  estimatedCredits: number | null;
};

export interface AiCreditGateway {
  reserve: (request: AiCreditReservationRequest) => Promise<AiCreditReservation>;
  settle: (reservation: AiCreditReservation) => Promise<void>;
  release: (reservation: AiCreditReservation) => Promise<void>;
}

const localDevelopmentGateway: AiCreditGateway = {
  reserve: async () => ({ reservationId: null, estimatedCredits: null }),
  settle: async () => undefined,
  release: async () => undefined,
};

let activeGateway = localDevelopmentGateway;

export function configureAiCreditGateway(gateway: AiCreditGateway) {
  activeGateway = gateway;
}

export function resetAiCreditGateway() {
  activeGateway = localDevelopmentGateway;
}

export async function reserveAiCredits(request: AiCreditReservationRequest) {
  return activeGateway.reserve(request);
}

export async function settleAiCredits(reservation: AiCreditReservation) {
  await activeGateway.settle(reservation);
}

export async function releaseAiCredits(reservation: AiCreditReservation) {
  await activeGateway.release(reservation);
}
