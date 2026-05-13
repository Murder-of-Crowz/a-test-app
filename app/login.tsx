import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "@/src/theme/colors";

export default function Login() {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>SG</Text>
        </View>
        <Text style={styles.title}>StudyGuide</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter your email'
              keyboardType='email-address'
              autoCapitalize='none'
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter your password'
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => alert("Sign In button pressed")}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => alert("Navigate to Forgot Password screen")}>
          <Text style={styles.forgotPassword}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 20 }}>
        <Text style={styles.registrationText}>
          Don't have an account?
          <TouchableOpacity onPress={() => alert("Navigate to Sign Up screen")}>
            <Text style={styles.signUp}> Sign up</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main screen wrapper
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.brand,
    paddingHorizontal: 20,
  },

  // Main content container
  container: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
  },
  // Header / title
  title: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Inter",
    marginBottom: 30,
    color: "#fff",
  },

  // Form layout
  formContainer: {
    width: "100%",
  },

  inputGroup: {
    width: "100%",
    marginBottom: 16,
  },

  label: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#fff",
    borderColor: "#d0d5dd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "gray",
    fontFamily: "Inter",
  },

  // Button
  btn: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  btnText: {
    color: "COLORS.brand",
    fontSize: 16,
    fontWeight: "normal",
    fontFamily: "Inter",
  },

  // Links
  forgotPassword: {
    color: "#007AFF",
    fontFamily: "Inter",
    marginTop: 10,
    marginBottom: 6,
  },
  registrationText: {
    color: "#666",
    fontFamily: "Inter",
  },

  signUp: {
    color: "#fff",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
