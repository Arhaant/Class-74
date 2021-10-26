import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import db from "../config"

export default class SearchScreen extends Component {
constructor(){
  super();
  this.state = {
    allTransactions: [],
    search: "",  
    lastVisibleTransaction: ""
  }
}



searchTransactions = async ()=>{
  var text = this.state.search.toUpperCase();
  var first_alphabet = text.split("")[0];

  if(first_alphabet === "B"){
    const transaction = await db.collection("transactions").where("bookId",'==',text).limit(10).get();
    transaction.docs.map((doc)=>{
      this.setState({
        allTransactions: [...this.state.allTransactions,doc.data()],
        lastVisibleTransaction: doc
      })
    })
  }
  else if(first_alphabet === "S"){
    const transaction = await db.collection("transactions").where("studentId",'==',text).limit(10).get();
    transaction.docs.map((doc)=>{
      this.setState({
        allTransactions: [...this.state.allTransactions,doc.data()],
        lastVisibleTransaction: doc
      })
    })
  }


}

fetchMoreTransactions = async ()=>{
  var text = this.state.search.toUpperCase();
  var first_alphabet = text.split("")[0];

  if(first_alphabet === "B"){
    const transaction = await db.collection("transactions").where("bookId",'==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
    transaction.docs.map((doc)=>{
      this.setState({
        allTransactions: [...this.state.allTransactions,doc.data()],
        lastVisibleTransaction: doc
      })
    })
  }
  else if(first_alphabet === "S"){
    const transaction = await db.collection("transactions").where("studentId",'==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
    transaction.docs.map((doc)=>{
      this.setState({
        allTransactions: [...this.state.allTransactions,doc.data()],
        lastVisibleTransaction: doc
      })
    })
  }


}

  render(){
  return (
    <View>
     <View style={styles.searchBar}>
          <TextInput
            style={styles.bar}
            placeholder="Enter Book Id or Student Id"
            onChangeText={(text) => { this.setState({ search: text }) }} />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => { this.searchTransactions() }}
          >
            <Text>Search</Text>
          </TouchableOpacity>
        </View>
        <FlatList 
        data = {this.state.allTransactions}
        renderItem = {({ item })=>(
          <View style={{borderBottomWidth: 2}}>    
            <Text>{"Book ID: " + item.bookId}</Text>
            <Text>{"Student ID: " + item.studentId}</Text>
            <Text>{"Transaction Type: " + item.transactionType}</Text>
            <Text>{"Date: " + item.date}</Text>
          </View>
        )}
          onEndReached = {this.fetchMoreTransactions}
          onEndReachedThreshold = {0.7}
          keyExtractor = {(item, index)=>index.toString()}

        />
    </View>
  );
 }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20
  },
  searchBar: {
    flexDirection: 'row',
    height: 40,
    width: 'auto',
    borderWidth: 0.5,
    alignItems: 'center',
    backgroundColor: 'grey',

  },
  bar: {
    borderWidth: 2,
    height: 30,
    width: 300,
    paddingLeft: 10,
  },
  searchButton: {
    borderWidth: 1,
    height: 30,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green'
  }
})
