import { useState } from "react";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from "react-native";
import { useRestaurant } from "../../src/hooks/useRestaurants";
import { useCartStore } from "../../src/store/cartStore";
import { groupMenuByCategory } from "../../src/lib/menu";
import { isOpenNow, todaysHoursLabel } from "../../src/lib/hours";
import { MenuItemRow } from "../../src/components/MenuItemRow";
import { ReservationBooker } from "../../src/components/ReservationBooker";
import { EmptyState } from "../../src/components/EmptyState";
import { colors, radius, spacing } from "../../src/theme";

type Tab = "menu" | "reserve";

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useRestaurant(id);
  const [tab, setTab] = useState<Tab>("menu");
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        <EmptyState title="Restaurant not found" description="It may have been removed." />
      </View>
    );
  }

  const { restaurant, menu, tables } = data;
  const open = isOpenNow(restaurant);
  const freeTables = tables.filter((t) => t.status === "free").length;
  const sections = groupMenuByCategory(menu);

  const header = (
    <View>
      <Image source={{ uri: restaurant.heroImageUrl }} style={styles.hero} />
      <View style={styles.infoBlock}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.description}>{restaurant.description}</Text>
        <Text style={styles.meta}>
          ★ {restaurant.rating.toFixed(1)} · {restaurant.cuisine.join(" · ")}
        </Text>
        <Text style={styles.address}>{restaurant.address}</Text>
        <View style={styles.statusCard}>
          <Text style={[styles.statusText, { color: open ? colors.success : colors.textFaint }]}>
            {open ? "Open now" : "Closed now"}
          </Text>
          <Text style={styles.statusMeta}>Today: {todaysHoursLabel(restaurant)}</Text>
          <Text style={styles.statusMeta}>
            {freeTables} of {tables.length} tables free right now
          </Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <Pressable onPress={() => setTab("menu")} style={styles.tabButton}>
          <Text style={[styles.tabLabel, tab === "menu" && styles.tabLabelActive]}>Order ahead</Text>
          {tab === "menu" && <View style={styles.tabIndicator} />}
        </Pressable>
        <Pressable onPress={() => setTab("reserve")} style={styles.tabButton}>
          <Text style={[styles.tabLabel, tab === "reserve" && styles.tabLabelActive]}>Reserve a table</Text>
          {tab === "reserve" && <View style={styles.tabIndicator} />}
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: restaurant.name }} />

      {tab === "menu" ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          renderItem={({ item }) => (
            <View style={styles.sectionBody}>
              <MenuItemRow
                item={item}
                onAdd={() =>
                  addItem(restaurant.id, {
                    menuItemId: item.id,
                    name: item.name,
                    priceCents: item.priceCents,
                  })
                }
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {header}
          <View style={styles.sectionBody}>
            <ReservationBooker restaurant={restaurant} />
          </View>
        </ScrollView>
      )}

      {tab === "menu" && cartCount > 0 && (
        <Link href="/checkout" asChild>
          <Pressable style={styles.cartBar}>
            <Text style={styles.cartBarText}>{cartCount} item(s) in your cart</Text>
            <Text style={styles.cartBarLink}>Go to checkout →</Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  center: {
    alignItems: "center",
    backgroundColor: colors.ink,
    flex: 1,
    justifyContent: "center",
  },
  hero: {
    height: 220,
    width: "100%",
  },
  infoBlock: {
    gap: spacing.xs,
    padding: spacing.lg,
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  address: {
    color: colors.textFaint,
    fontSize: 12,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },
  statusMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  tabRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  tabButton: {
    paddingBottom: spacing.sm,
  },
  tabLabel: {
    color: colors.textFaint,
    fontSize: 14,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: colors.text,
  },
  tabIndicator: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    height: 2,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    backgroundColor: colors.ink,
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    textTransform: "uppercase",
  },
  sectionBody: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xxl * 2,
  },
  cartBar: {
    alignItems: "center",
    backgroundColor: colors.inkLight,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    left: spacing.lg,
    padding: spacing.md,
    position: "absolute",
    right: spacing.lg,
  },
  cartBarText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  cartBarLink: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
});
