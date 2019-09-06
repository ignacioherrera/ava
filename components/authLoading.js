import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import firebase from '../Firebase';
import AsyncStorage from '@react-native-community/async-storage';
export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }
  // Fetch the token from storage then navigate to our appropriate place

  _bootstrapAsync = async () => {
    firebase.auth().onAuthStateChanged(user => {
      if(user){
        AsyncStorage.getItem('initial').then(value =>{
          if (value === null) {
            this.props.navigation.navigate('Initial');
          } 
          else {
            try {
              AsyncStorage.getItem('user').then(value=>{
                if (value !== null) {

                  this.props.navigation.navigate('Info'); 
                }
                else {
                  this.props.navigation.navigate('Sign');
                }
              }); 
            } catch (e) {
              this.props.navigation.navigate('Login');
            }
          }
        })
      }
      else{
        AsyncStorage.getItem('auth').then(auth=>{
            if(auth){
              firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(res=>{

              }).catch(err=>{
                this.props.navigation.navigate('Login');
              });
            }
        }) 
        this.props.navigation.navigate('Login');
      }
    }) 
  }
  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size='large' style={styles.loading} />
        <StatusBar barStyle="default" />
        <Text style={{marginTop: 60}}>Connecting to the server</Text>
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