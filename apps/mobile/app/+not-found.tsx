import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { EmptyState } from "../src/components/EmptyState";
import { Button } from "../src/components/Button";
import { colors, spacing } from "../src/theme";

export default function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <EmptyState
        title="Page not found"
        description="The page you're looking for doesn't exist."
        action={
          <Link href="/" asChild>
            <Button label="Back to discovery" variant="secondary" />
          </Link>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
});
