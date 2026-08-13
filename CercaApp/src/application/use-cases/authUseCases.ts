import type {
  AuthRepository,
  SignInInput,
  SignUpInput,
} from "@/application/ports/AuthRepository";

export function signInUseCase(
  repository: AuthRepository,
  input: SignInInput,
) {
  return repository.signIn(input);
}

export function signUpUseCase(
  repository: AuthRepository,
  input: SignUpInput,
) {
  return repository.signUp(input);
}

export function refreshSessionUseCase(
  repository: AuthRepository,
  refreshToken: string,
) {
  return repository.refreshSession(refreshToken);
}

export function signOutUseCase(
  repository: AuthRepository,
  accessToken: string,
  refreshToken: string,
) {
  return repository.signOut(
    accessToken,
    refreshToken,
  );
}
