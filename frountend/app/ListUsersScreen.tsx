import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useWindowDimensions } from "react-native";
import { Card } from "react-native-paper";
import Toast from "react-native-toast-message";
import { API } from "../src/services/api";

type User = {
  name: string;
  username: string;
  privilege: string;
  table: string;
};

const UserManagementScreen = () => {
  const { width } = useWindowDimensions();
  const [view, setView] = useState<"list" | "delete" | "update">("list");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [privilege, setPrivilege] = useState("");
  const [password, setPassword] = useState("");
  const [table, setTable] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList: User[] = await API.listUsers();
        setUsers(userList);
      } catch (error: any) {
        Alert.alert("Error", error.response?.data?.detail || "Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    try {
      await API.deleteUser(username);
      Toast.show({ type: "success", text1: "Success", text2: "User deleted successfully!" });
      setUsername("");
      setView("list");
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Error", text2: error.response?.data?.detail || "Deletion failed." });
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser || !name || !privilege || !password || !table) {
      Alert.alert("Error", "All fields must be filled.");
      return;
    }

    try {
      await API.updateUser(selectedUser.username, { name, username: selectedUser.username, privilege, password, table });
      Alert.alert("Success", "User updated successfully!");
      setView("list");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.detail || "Update failed.");
    }
  };

  const renderUserList = () => (
    <FlatList
      data={users}
      keyExtractor={(item) => item.username}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.detail}>Username: {item.username}</Text>
            <Text style={styles.detail}>Privilege: {item.privilege}</Text>
            <Text style={styles.detail}>Table: {item.table}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={() => {
                  setSelectedUser(item);
                  setName(item.name);
                  setPrivilege(item.privilege);
                  setTable(item.table);
                  setPassword("");
                  setView("update");
                }}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => {
                  setUsername(item.username);
                  setView("delete");
                }}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      )}
    />
  );
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {view === "list" && (
        <>
          <Text style={styles.title}>User List</Text>
          {renderUserList()}
        </>
      )}

      {view === "delete" && (
        <View style={[styles.formContainer, { width: width > 768 ? "50%" : "90%" }]}>
          <Text style={styles.title}>Delete User</Text>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleDelete}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {view === "update" && (
        <View style={[styles.formContainer, { width: width > 768 ? "50%" : "90%" }]}>
          <Text style={styles.title}>Update User</Text>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Privilege" value={privilege} onChangeText={setPrivilege} style={styles.input} />
          <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
          <TextInput placeholder="Table" value={table} onChangeText={setTable} style={styles.input} />
          <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        </View>
      )}
      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#ffe371",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    width: "48%",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  updateButton: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#FF5733",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    elevation: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#CCC",
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#FF6F61",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
});

export default UserManagementScreen;