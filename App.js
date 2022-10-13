// @refresh reset
import React, { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { GiftedChat } from "react-native-gifted-chat";

const firebaseConfig = {
  apiKey: "AIzaSyAlOew550yUx9pRLgOqqNMPNrPSCxGlrQA",
  authDomain: "rnchatapp-5a542.firebaseapp.com",
  projectId: "rnchatapp-5a542",
  storageBucket: "rnchatapp-5a542.appspot.com",
  messagingSenderId: "867547207874",
  appId: "1:867547207874:web:2c8e545002900ff005c35b",
};

let app;

if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const db = firebase.firestore();
const chatsRef = db.collection("chats");

const App = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    readUser();
    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      const messageFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === "added")
        .map(({ doc }) => {
          const message = doc.data();
          return { ...message, createdAt: message.createdAt.toDate() };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messageFirestore);
    });
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback(
    (messages) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
    },
    [messages]
  );

  const readUser = async () => {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }
  };

  const handlePress = async () => {
    const _id = Math.random().toString(36).substring(7);
    const user = { _id, name };
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const handleSend = async (messages) => {
    const writes = messages.map((m) => chatsRef.add(m));
    await Promise.all(writes);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity onPress={() => handlePress()} style={styles.button}>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>
            Start Chatting!
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <GiftedChat messages={messages} user={user} onSend={handleSend} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  textInput: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    padding: 2,
    borderColor: "grey",
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "blue",
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default App;
