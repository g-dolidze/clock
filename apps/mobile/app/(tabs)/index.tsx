import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useRestaurants } from "../../src/hooks/useRestaurants";
import { RestaurantCard } from "../../src/components/RestaurantCard";
import { EmptyState } from "../../src/components/EmptyState";
import { isOpenNow } from "../../src/lib/hours";
import { colors, spacing } from "../../src/theme";

export default function DiscoveryScreen() {
  const [query, setQuery] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const { data, isLoading, isError } = useRestaurants({ q: query || undefined });

  const restaurants = useMemo(() => {
    const list = data?.restaurants ?? [];
    return openNow ? list.filter((r) => isOpenNow(r)) : list;
  }, [data, openNow]);

  return (
    <View style={styles.screen}>
      <View style={styles.intro}>
        <Text style={styles.heading}>Find the table, skip the wait</Text>
        <Text style={styles.subheading}>
          Book ahead or order for pickup / dine-in, and walk straight to a seat that's ready.
        </Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search restaurants, cuisines..."
        placeholderTextColor={colors.textFaint}
        style={styles.search}
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Open now</Text>
        <Switch
          value={openNow}
          onValueChange={setOpenNow}
          trackColor={{ true: colors.accent, false: "rgba(255,255,255,0.15)" }}
          thumbColor="#ffffff"
        />
      </View>

      {isLoading && <ActivityIndicator color={colors.accent} style={styles.loading} />}
      {isError && <EmptyState title="Couldn't load restaurants" description="Check your connection and try again." />}
      {!isLoading && !isError && restaurants.length === 0 && (
        <EmptyState title="No restaurants match" description="Try a different search or clear filters." />
      )}

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RestaurantCard restaurant={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  intro: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subheading: {
    color: colors.textMuted,
    fontSize: 13,
  },
  search: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  toggleLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  loading: {
    paddingVertical: spacing.xl,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
