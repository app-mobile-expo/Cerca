import { SafeAreaView } from "react-native-safe-area-context";

import { Home } from "../../components/Home/Home";

export default function HomeScreen() {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
      <Home />
    </SafeAreaView>
  );
}
