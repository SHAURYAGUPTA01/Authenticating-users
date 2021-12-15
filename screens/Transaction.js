import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, TextInput, KeyboardAvoidingView, ToastAndroid } from "react-native";
import * as Permissions from "expo-permissions"
import { BarCodeScanner } from "expo-barcode-scanner"
import db from "../config";
import firebase from "firebase";

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class TransactionScreen extends Component {
  constructor() {
    super();
    this.state = {
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      scannedData: "",
      bookId: "",
      studentId: "",
      bookName: "",
      studentName: ""
    }
  }

  getCameraPermissions = async (domState) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    /*
    status === granted is true when user has granted permission
    status === granted is false when user has not granted permission
    */
    this.setState({
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false
    })
  }

  handleBarCodeScanned = async ({ type, data }) => {
    const { domState } = this.state;
    if (domState === "bookId") {
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true,
      })
    } else if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true,
      })
    }
  }

  handleTransaction = async () => {
    var { bookId, studentId } = this.state;
    await this.getBookDetails(bookId);
    await this.getStudentDetails(studentId);

    db.collection("books")
      .doc(bookId)
      .get() //PROMISE

      .then(doc => {
        //doc.data() is used to get all the information stored in the document
        console.log(doc.data())
        var book = doc.data();
        if (book.is_book_available) {
          var { bookName, studentName } = this.state;
          this.initiateBookIssue(bookId, studentId, bookName, studentName);
          // ToastAndroid.show("book issued to student", ToastAndroid.SHORT)
          alert("Book is issued !!")
        }
        else {
          var { bookName, studentName } = this.state;
          this.initiateBookReturn(bookId, studentId, bookName, studentName);
          //   ToastAndroid.show("book returned to student", ToastAndroid.SHORT)
          alert("Book is returned !!")
        }
      })

  }

  initiateBookIssue = (bookId, studentId, bookName, studentName) => {
    //add a transaction
    db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "issue"
    })
    //change the book status
    db.collection("books").doc(bookId).update({
      is_book_available: false,
    })

    //changing number of books issued
    db.collection("students").doc(studentId).update({
      number_of_books_issued: firebase.firestore.FieldValue.increment(1)
    })

    this.setState({
      bookId: "",
      studentId: ""
    });
  }

  initiateBookReturn = (bookId, studentId, bookName, studentName) => {
    db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return"
    })
    db.collection("books").doc(bookId).update({
      is_book_available: true,
    })

    db.collection("students").doc(studentId).update({
      number_of_books_issued: firebase.firestore.FieldValue.increment(-1)
    })

    this.setState({
      bookId: "",
      studentId: ""
    });
  }

  getBookDetails = bookId => {
    bookId = bookId.trim();
    db.collection("books")
      .where("book_id", "==", bookId)
      .get()

      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({ bookName: doc.data().book_details.book_name })
        }
        )
      })
  }

  getStudentDetails = studentId => {
    studentId = studentId.trim();
    db.collection("students")
      .where("student_id", "==", studentId)
      .get()

      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({ studentName: doc.data().student_details.student_name })
        }
        )
      })
  }

  render() {
    //db.collection(<collectionName>).doc(<docId>).get()
    //destructuring assignment
    const { domState, hasCameraPermissions, scanned, scannedData, bookId, studentId } = this.state
    if (domState !== "normal") {
      return (
        <BarCodeScanner onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
      )
    }
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <View>
          <ImageBackground
            source={bgImage}
            style={styles.bgImage}>
            <View style={styles.upperContainer}>
              <Image source={appIcon} style={styles.appIcon}></Image>
              <Image source={appName} style={styles.appName}></Image>
            </View>

            <View style={styles.lowerContainer}>
              <View style={styles.textinputContainer}>
                <TextInput
                  style={styles.textinput}
                  placeholder={"Book ID"}
                  placeholderTextColor={"white"}
                  value={bookId}
                  onChangeText={info => this.setState({ bookId: info })} />
                <TouchableOpacity
                  style={styles.scanbutton}
                  onPress={() => this.getCameraPermissions("bookId")} >
                  <Text style={styles.scanbuttonText}>Scan</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.textinputContainer, { marginTop: 25 }]} >
                <TextInput style={styles.textinput}
                  placeholder={"Student ID"}
                  placeholderTextColor={"white"}
                  value={studentId}
                  onChangeText={info => { this.setState({ studentId: info }) }} />
                <TouchableOpacity
                  style={styles.scanbutton}
                  onPress={() => this.getCameraPermissions("studentId")} >
                  <Text style={styles.scanbuttonText}>Scan</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, { marginTop: 25 }]}
                onPress={() => this.handleTransaction()}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground >
        </View >
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5653D4"
  },
  text: {
    color: "black",
    fontSize: 30
  },
  button: {
    width: "50%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 15
  },
  buttonText: {
    fontSize: 24,
    color: "white"
  },
  lowerContainer: {
    marginTop: 50,
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "blue",
    borderColor: "black"
  },
  textinput: {
    width: 105,
    height: 50,
    padding: 10,
    borderWidth: 2,
    borderRadius: 7,
    fontSize: 19,
    backgroundColor: "blue",
    fontFamily: "Rajdhani_600SemiBold",
    color: "black"
  },
  scanbutton: {
    width: 80,
    height: 50,
    backgroundColor: "red",
    border: 10,
    borderRadius: 7,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 20,
    color: "black",
    fontFamily: "Rajdhani_600SemiBold"
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 80,
    height: 80,
    resizeMode: "contain"
  },

});
