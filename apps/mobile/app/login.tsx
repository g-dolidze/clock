import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useLogin } from "../src/hooks/useAuth";
import { Button } from "../src/components/Button";
import { colors, spacing } from "../src/theme";

const schema = z.object({
  name: z.string().min(1, "Tell us what to call you").max(120),
  email: z.string().min(3, "Enter a valid email").email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const login = useLogin();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "" } });

  function onSubmit(values: FormValues) {
    login.mutate(values, {
      onSuccess: () => router.back(),
    });
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.subheading}>
        No password needed — just your name and email. We use this to track your orders and
        reservations.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Nino Beridze"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="nino@example.com"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </View>

      {login.isError && <Text style={styles.error}>Sign in failed. Please try again.</Text>}

      <Button label="Continue" loading={login.isPending} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  subheading: {
    color: colors.textMuted,
    fontSize: 13,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});
