export type CategoryId = string;

export interface Category {
  readonly id: CategoryId;
  readonly slug: string;
  readonly name: string;
}
