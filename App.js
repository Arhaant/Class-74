import React, { Component } from 'react';
import SearchScreen from './screens/SearchScreen'
import TransactionScreen from './screens/TransactionScreen'
import { StyleSheet, Text, View, Image } from 'react-native';
import {createAppContainer} from 'react-navigation'
import {createBottomTabNavigator} from 'react-navigation-tabs'

export default class App extends Component {
  render(){
  return (
   <AppContainer/>
  );
 }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


var AppNavigator = createBottomTabNavigator({
  Search : SearchScreen,
  Transaction : TransactionScreen
},
{
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: () => {
      const { routeName } = navigation.state;
      if (routeName === 'Transaction') {
        return (<Image source={require('./assets/book.png')} style={{ width:40, height:40  }}/>)
      } else if (routeName === 'Search') {
        return (<Image source={require('./assets/searchingbook.png')} style={{ width:40, height:40  }}/>)
      }

      
    },
  }),
})

const AppContainer = createAppContainer(AppNavigator)
  