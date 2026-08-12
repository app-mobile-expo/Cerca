// Fuerza en tiempo de compilación a cubrir todas las variantes de una unión discriminada en un switch
export function assertNever(value: never): never {
  throw new Error(`Unhandled union case: ${JSON.stringify(value)}`);
}
