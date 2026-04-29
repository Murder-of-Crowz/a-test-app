import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function Login() {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign in to Test-App</Text>

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
        <Text style={{ color: "#666", fontFamily: "Inter" }}>
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
    backgroundColor: "#f4f6f8",
    paddingHorizontal: 20,
  },

  // Main content container
  container: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },

  // Header / title
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Inter",
    marginBottom: 30,
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
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  btnText: {
    color: "#fff",
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

  signUp: {
    color: "#007AFF",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
