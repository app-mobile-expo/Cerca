export type Capacity = 'customer' | 'provider';

export type PlatformRole =
  | 'user'
  | 'moderator'
  | 'admin';

export interface Actor {
  id: string;
  capacities: Capacity[];
  platformRole: PlatformRole;
}