import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './src/presentation/components/Button/Button';

export default function App() {

  const handlePress = () =>{
     console.log("ola")
  }
  return (
    <View style={styles.container}>
        <Button title='Press' onPress={handlePress}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
