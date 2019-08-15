/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, ActivityIndicator, Switch, Picker, } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import firebase from '../Firebase';
import AsyncStorage from '@react-native-community/async-storage';
type Props = {};
class EventChat extends Component<Props> {
  constructor(props) {
    super(props);
    this.props.navigation;
    this.refUsers = firebase.firestore().collection('users');
    this.refmessages = firebase.firestore().collection('messages').where('for_user.key', '==', this.userActive.key).where('birth_date', '==', JSON.parse(JSON.stringify(this.userActive.actual_birth)));
    this.unsubscribe = null;
    this.state = {
        user: null,
        isLoading: true,
    };
  }
  static navigationOptions = ({ navigation })=>{
      return {
    title: 'uu',
    headerStyle: {
    },
    headerTintColor: '#7E7E7E',
    headerTitleStyle: {
      color: "#7E7E7E",
      fontSize: 27,
      fontFamily: "Lato-Bold"
    },
  }};
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((m) => {
      messages.push( 
          this.parse(m)
      );
      messages.sort(function(a,b){
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    });
    console.log('los mensajes',messages);
    this.setState({
      messages,
      isLoading: false,
    });
  }
  parse = (snapshot) => {
    // 1.
    const { timestamp: numberStamp, text, user, _id } = snapshot.data();
    const { } = snapshot;
    // 2.
    console.log('El que vira en la peticion', snapshot.data());
    console.log(text);
    let timestamp = new Date(); 
    if(numberStamp) timestamp = numberStamp.toDate();
    // 3.
    const message = {
      _id,
      timestamp,
      text,
      user,
    };
   return message;
  }
  componentDidMount() {
        const { navigation } = this.props;
        AsyncStorage.getItem('user').then((user) => {
            if(user){
                u = JSON.parse(user);
                console.log('el user del async storage', u);
                this.setState({user:{_id:u.key, name:u.name, avatar: u.avatar}});
                try {
                  this.unsubscribe = this.refmessages.onSnapshot(this.onCollectionUpdate, (error)=>{
                    alert('Firebase connection error');});
                }
                catch (e) {
                  alert('No Connection with Firebase');
                }
            }
        })
        .catch(()=>{alert('Can not get the user from the async storage')});
        
          willFocusSubscription = this.props.navigation.addListener(
            'willBlur',
            payload => {
                this.unsubscribe();
            }
          );
      }
      
      send = (messages)=>{
          try{
            for (let i = 0; i < messages.length; i++) {
                const { text, user, _id } = messages[i];
                
                const message = {
                  text,
                  user,
                  _id,
                  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                  
                };
                console.log('add message ', messages);
                console.log('add message server', message);
                firebase.firestore().collection('messages').add(message).then(()=>{

                }).catch((e)=>{
                  alert(e);
                }); 
              } 
          }
          catch(e){
              alert(e);
          }
      };
  render() {
      if(this.state.isLoading){
        return (
            <View style={styles.container}>
              <ActivityIndicator size="large" color="#000" animating={true} style={[styles.loading]} />
            </View>
          );   
      }
    return (
        <GiftedChat
        messages={this.state.messages}
        onSend={this.send}
        user={this.state.user}

      />
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockText: {
      paddingHorizontal: 10,
      textAlign: 'center'
  }
  
});
export default EventChat;