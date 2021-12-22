import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList
} from "react-native";
import db from "../config"
import { ListItem, Icon } from "react-native-elements";


export default class SearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allTransactions: [],
      searchText: "",
      lastVisibleTransaction: null
    };
  }
  componentDidMount = async () => {
    this.getTransactions();
  };

  getTransactions = () => {
    db.collection("transactions")
      .limit(10)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            allTransactions: [...this.state.allTransactions, doc.data()],
            lastVisibleTransaction: doc
          });
        });
      });

  };

  handleSearch = async text => {
    var enteredText = text.toUpperCase().split("")
    text = text.toUpperCase()
    this.setState({ allTransactions: [] })
    if (!text) {
      this.getTransactions();
    }

    if (enteredText[0] === "B") {
      db.collection("transactions")
        .where("book_id", "==", text)
        .get()
        .then(snapshot => {
          snapshot.docs.map(doc => {
            this.setState({
              allTransactions: [...this.state.allTransactions, doc.data()],
              lastVisibleTransaction: doc

            });
          });
        });
    } else if (enteredText[0] === "S") {
      db.collection("transactions")
        .where("student_id", "==", text)
        .get()
        .then(snapshot => {
          snapshot.docs.map(doc => {
            this.setState({
              allTransactions: [...this.state.allTransactions, doc.data()],
              lastVisibleTransaction: doc
            });
          });
        });
    }


  };

  fetchMoreTransactions = async text => {
    var enteredText = text.toUpperCase().split("")
    text = text.toUpperCase()
    const { lastVisibleTransaction, allTransactions } = this.state;
    if (enteredText[0] === "B") {
      const query = await db
        .collection("transactions")
        .where("book_id", "==", text)
        .startAfter(lastVisibleTransaction)
        .limit(10)
        .get();
      query.docs.map(doc => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        });
      });
    } else if (enteredText === "S") {
      const query = await db
        .collection("transactions")
        .where("student_id", "==", text)
        .startAfter(lastVisibleTransaction)
        .limit(10)
        .get();
      query.docs.map(doc => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        });
      });
    }

  };

  renderItem = ({ item, i }) => {
    var transactionType = item.transaction_type === "issue" ? "issued" : "returned";
    return (
      <View style={{ borderWidth: 1 }}>
        <ListItem key={i} bottomDivider>
          <Icon type={"antdesign"} name={"book"} size={40} />
          <ListItem.Content>
            <ListItem.Title style={styles.title}>
              {`${item.book_name} (${item.book_id})`}
            </ListItem.Title>

            <ListItem.Subtitle style={styles.subtitle}>
              {` This book ${transactionType} by (${item.student_name})`}
            </ListItem.Subtitle>
            <View style={styles.lowerLeftContaiiner}>
              <View style={styles.transactionContainer}>
                <Text style={[styles.transactionText, { color: item.transaction_type === "issue" ? "green" : "orange" }]}>
                  {item.transaction_type}
                </Text>
                <Icon
                  type={"ionicon"}
                  name={item.transaction_type === "issue" ? "checkmark-circle-outline" : "arrow-redo-circle-outline"}
                />
              </View>
            </View>
          </ListItem.Content>
        </ListItem>
      </View>
    );
  };

  render() {
    const { searchText, allTransactions } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <View style={styles.textinputContainer}>
            <TextInput
              style={styles.textinput}
              onChangeText={info => {
                this.setState({ searchText: info })
              }}
              placeholder={"Type here"}
              placeholderTextColor={"#FFFFFF"}
            />
            <TouchableOpacity style={styles.scanbutton} onPress={() => this.handleSearch(searchText)}>
              <Text style={styles.scanbuttonText}>
                Search
              </Text>
            </TouchableOpacity>

          </View>
        </View>
        <View style={styles.lowerContainer}>
          <FlatList
            data={allTransactions}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={() => this.fetchMoreTransactions(searchText)}
            onEndReachedThreshold={0.7}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5653D4"
  },
  upperContainer: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 24,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
  },
  lowerContainer: {
    flex: 0.8,
    backgroundColor: "#FFFFFF"
  },
  title: {
    fontSize: 20,
    fontFamily: "Rajdhani_600SemiBold"
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Rajdhani_600SemiBold"
  },
  lowerLeftContaiiner: {
    alignSelf: "flex-end",
    marginTop: -40
  },
  transactionContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center"
  },
  transactionText: {
    fontSize: 20,

    fontFamily: "Rajdhani_600SemiBold"
  },
  date: {
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
    paddingTop: 5
  }
});