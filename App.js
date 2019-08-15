/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import Navigator from './navigator'; 
import AsyncStorage from '@react-native-community/async-storage';
import {
  Platform,
  ActivityIndicator, 
  StyleSheet,
} from 'react-native';

const Nav = Navigator;
const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});
type Props = {};

export default class App extends React.Component {
  constructor(props) { 
    super(props);  
    this.state = {
      loading: true
    }
  }
  clearAll = async () => {
    try {
      await AsyncStorage.clear()
    } catch(e) {
      // clear error
    }
  
    console.log('Done.') 
  }
  componentDidMount(){
  /* this.clearAll();*/
  }
  
  render() {
       /* if(this.state.loading) return (<ActivityIndicator size="large" color="#000" animating={true} style={styles.loading}/>);*/
        /*if(this.state.user) */
        return (<Nav/>);
        /*else{ 
          return (<Auth/>);
        }*/  
  }
}  
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    position: 'absolute',
    display: 'flex',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
});

