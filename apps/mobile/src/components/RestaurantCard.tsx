import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { priceRangeLabel, type Restaurant } from "@ontime/web-shared/server";
import { isOpenNow } from "../lib/hours";
import { Card } from "./Card";
import { colors, spacing } from "../theme";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const open = isOpenNow(restaurant);

  return (
    <Pressable onPress={() => router.push(`/restaurant/${restaurant.id}`)}>
      <Card style={styles.card}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: restaurant.heroImageUrl }} style={styles.image} />
          <View style={[styles.pill, { backgroundColor: open ? "#059669e6" : "#00000099" }]}>
            <Text style={styles.pillText}>{open ? "Open now" : "Closed"}</Text>
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <Text style={styles.rating}>★ {restaurant.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {restaurant.description}
          </Text>
          <Text style={styles.meta}>
            {restaurant.cuisine.join(" · ")} · {priceRangeLabel(restaurant.priceRange)}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {restaurant.address}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
  imageWrap: {
    aspectRatio: 16 / 9,
    width: "100%",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    position: "absolute",
    left: spacing.md,
    top: spacing.md,
  },
  pillText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  body: {
    gap: spacing.xs,
    padding: spacing.lg,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  rating: {
    color: colors.textMuted,
    fontSize: 13,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
  },
  meta: {
    color: colors.textFaint,
    fontSize: 12,
  },
  address: {
    color: colors.textFaint,
    fontSize: 12,
  },
});
