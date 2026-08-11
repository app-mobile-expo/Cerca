import {ButtonProps} from './Button.type';
import {Pressable, Text, StyleSheet} from 'react-native';


export const Button = ({onPress, title}: ButtonProps) => {
  return(
      <Pressable style={styles.button} onPress={onPress}>
           <Text style={styles.text}>{title}</Text>
      </Pressable>
  )  
}


const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },

  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});