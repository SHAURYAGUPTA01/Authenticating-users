import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Permissions from "expo-permissions"
import { BarCodeScanner } from "expo-barcode-scanner"

export default class TransactionScreen extends Component {
  constructor() {
    super();
    this.state = {
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      scannedData: ""
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
    this.setState({
      scannedData: data,
      domState: "normal",
      scanned: true,
    })
  }

  render() {
    //destructuring assignment
    const { domState, hasCameraPermissions, scanned, scannedData } = this.state
    if (domState === "scanner") {
      return (
        <BarCodeScanner onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
      )
    }
    return (
      <View style={styles.container}>
        <Text style = {styles.buttonText}> 
          {hasCameraPermissions ? scannedData : "request for camera permission"}
        </Text>
        <Text style={styles.text}>Transaction Screen</Text>
        <TouchableOpacity onPress={() => {
          this.getCameraPermissions("scanner")
        }} style = {styles.button}>
          <Text style = {styles.buttonText}>
            Scan QR Code
          </Text>
        </TouchableOpacity>
      </View>
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
    color: "#ffff",
    fontSize: 30
  },
  button: {
    width: "43%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f48d20",
    borderRadius: 15,
  },
  buttonText: {
    color: "#ffff",
    fontSize: 15
  }
});
