import React, { Component } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import * as Permissions from "expo-permissions"
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase'
import db from "../config"

export default class TransactionScreen extends Component {
  constructor() {
    super()
    this.state = {
      buttonState: "normal",
      hasCameraPerms: null,
      scanned: false,
      scannedBookID: "",
      scannedStudentID: "",
      bookOrSt: ""
    }
  }

  bookIssue = async () => {
    db.collection("transactions").add({
      "studentId":this.state.scannedStudentID,
      "bookId":this.state.scannedBookID,
      "transactionType":"issue",
      "date":firebase.firestore.Timestamp.now().toDate()
    })
    db.collection("books").doc(this.state.scannedBookID).update({
      'bookAvailability':false
    })
    db.collection("students").doc(this.state.scannedStudentID).update({
      'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
      scannedStudentID:'',
      scannedBookID:''
    })
  }

  
  bookReturn = async () => {
    db.collection("transactions").add({
      "studentId":this.state.scannedStudentID,
      "bookId":this.state.scannedBookID,
      "transactionType":"return",
      "date":firebase.firestore.Timestamp.now().toDate()
    })
    db.collection("books").doc(this.state.scannedBookID).update({
      'bookAvailability':true
    })
    db.collection("students").doc(this.state.scannedStudentID).update({
      'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedStudentID:'',
      scannedBookID:''
    })
  }

  checkStudentEligibilityForBookIssue = async ()=>{
    const studentRef = await db.collection("students").where("studentId","==", this.state.scannedStudentID).get();
    var isStudentDisciplineQuestionMark = "";
    if(studentRef.docs.length == 0){
      isStudentDisciplineQuestionMark=false;
      alert("Wrong school, we will be contacting you school soon for your behaviour")
      this.setState({
        scannedStudentID:"",
        scannedBookID:""
      })
    } else{
      studentRef.docs.map((doc) => {
        var student = doc.data();
        if(student.numberOfBooksIssued<2){
          isStudentDisciplineQuestionMark = true;
        } else{
          isStudentDisciplineQuestionMark = false;
          alert("2 books max")
          this.setState({
            scannedBookID: "",
            scannedStudentID: "",
          })
        }
      }) 
    }
    return isStudentDisciplineQuestionMark;
  }


  checkStudentEligibilityForBookReturn = async ()=>{
    const transactionRef = await db.collection("transactions").where("bookId","==", this.state.scannedBookID).limit(1).get();
    var isStudentDisciplineQuestionMark = "";
     transactionRef.docs.map((doc) => {
        var transaction = doc.data();
        if(transaction.studentId === this.state.scannedStudentID){
          isStudentDisciplineQuestionMark = true;
        } else{
          isStudentDisciplineQuestionMark = false;
          alert("Ay you havent issued this book")
          this.setState({
            scannedBookID: "",
            scannedStudentID: "",
          })
        }
      }) 
    return isStudentDisciplineQuestionMark;
  }


  checkBookEligibility = async ()=>{
    const bookRef = await db.collection("books").where("bookId","==",this.state.scannedBookID).get();
    var transactionType = "";
    if(bookRef.docs.length == 0){
      transactionType=false;
    } else{
      bookRef.docs.map((doc) => {
      var book = doc.data();
      if(book.bookAvailability){
        transactionType = "Issue"
      }else {
        transactionType = "Return"
      }
      })
    }
    return transactionType;
  }

  handleTransaction = async () => {
    var transactionType = await this.checkBookEligibility();
    if(!transactionType){
      alert("The book doesn't exist in the db");
      this.setState({
        scannedStudentID:'',
        scannedBookID:''
      })
    }
    else if(transactionType==="Issue"){
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if(isStudentEligible){
        this.bookIssue();
        alert("Book has been issued")
      }
    }
    else{
      var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
      if(isStudentEligible){
        this.bookReturn();
        alert("Book has been returned")
      }
    }
  }

  getCameraPerms = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      buttonState: "clicked",
      hasCameraPerms: status === "granted",
      scanned: false,
      bookOrSt: id
    })
  }

  handleBarcodeScanner = async ({ type, data }) => {
    const { bookOrSt } = this.state
    if (bookOrSt === 'bookID') {
      this.setState({
        scannedBookID: data,
        buttonState: "normal",
        scanned: true
      })
    }
    else if (bookOrSt === 'studentID') {
      this.setState({
        scannedStudentID: data,
        buttonState: "normal",
        scanned: true
      })

    }
  }

  render() {
    const { buttonState, hasCameraPerms, scanned, scannedData } = this.state

    if (buttonState === "clicked" && hasCameraPerms === false) {
      return (
        <Text>Permission Denied</Text>
      )
    }

    else if (buttonState === "clicked" && hasCameraPerms === true) {
      return (
        <BarCodeScanner onBarCodeScanned={scanned ? undefined : this.handleBarcodeScanner}
          style={StyleSheet.absoluteFillObject}></BarCodeScanner>
      )
    }

    else {

      return (
        <View style={styles.container}>
          <View>
            <Image source={require('../assets/booklogo.jpg')} style={{ width: 100, height: 100 }} />
            <Image source={require('../assets/Title.png')} style={{ width: 100, height: 100 }} />
          </View>
          <View style={{ flexDirection: "row" }}>
            <TextInput placeholder='bookID' value={this.state.scannedBookID} style={styles.inputBocks} onChangeText={text=>this.setState({scannedBookID:text})}/>
            <TouchableOpacity style={styles.scanButton} onPress={() => { this.getCameraPerms("bookID") }}><Text style={styles.textStyle}>Click to scan</Text></TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row" }}>
            <TextInput placeholder='studentID' value={this.state.scannedStudentID} style={styles.inputBocks} onChangeText={text=>this.setState({scannedStudentID:text})}/>
            <TouchableOpacity style={styles.scanButton} onPress={() => { this.getCameraPerms("studentID") }}><Text style={styles.textStyle}>Click to scan</Text></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={async () => { var transactionMessage = await this.handleTransaction() }} style={styles.submitStyle}>
            <Text style={styles.submitTextStyle}>Submit</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5653D4"
  },
  buttonImage: {
    backgroundColor: "cyan",
    borderRadius: 20,
    width: 70,

  },

  textStyle: {
    textAlign: "center"
  },

  inputBocks: {
    width: 100,
    height: 50,
    borderWidth: 2,
    fontSize: 25
  },

  scanButton: {
    backgroundColor: "cyan",
    width: 50,
    borderWidth: 1
  },

  submitStyle: {
    backgroundColor: "cyan",
    width: 50,
      height: 20
  },

  submitTextStyle: {
    color: "white", 
    textAlign: 'center',
    fontWeight: "bold",
  },


})