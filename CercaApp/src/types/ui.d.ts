export interface AppButtonProps {
  readonly onPress: () => void;
  readonly title: string;
}

export interface AppInputProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly placeholder: string;
}
