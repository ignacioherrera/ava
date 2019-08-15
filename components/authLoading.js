import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }
  // Fetch the token from storage then navigate to our appropriate place

  _bootstrapAsync = async () => {
    try {
      const value = await AsyncStorage.getItem('user');
      if(value !== null) {
        this.props.navigation.navigate('Info');
      }
      else{
        this.props.navigation.navigate('Sign');
      }
    } catch(e) {
      this.props.navigation.navigate('Sign');
    }
  }
  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size='large' style={styles.loading}/>
        <StatusBar barStyle="default" />
      </View>
    );
  }
} 
const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    display: 'flex',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  }
});