/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import firebase from '../Firebase';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import MyButton from '../components/myButton';

type Props = {};

class Login extends Component<Props> {
  constructor(props) {
    super(props);
    this.ref = firebase.firestore().collection('users');

    this.state = {
      email: '',
      password: '',
      error: false,
      errorConnect: false,
      loading: false,
      connectionFailed:'A network error has ocurred check your internet connection'
    };
  }
  static navigationOptions = {
    header: null
  }
  validate = () => {
    const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (this.state.email === '' || !regexp.test(this.state.email)) {
      this.setState({ error: true });

      return false;
    }
    if (this.state.password === '') {
      this.setState({ error: true });
      return false;
    }
    return true;
  } 
  login=() =>{
    if (this.validate()) { 
      this.setState({loading: true});
      firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(res => { 
            const user = { 'uid': res.user.uid, password: this.state.password, email: this.state.email };
            AsyncStorage.setItem('auth', JSON.stringify(user))
              .then(() => {
                this.ref.where('uid', '==', user.uid).get().then((query) => {
                  let info = null;
                  query.forEach(doc => {
                    const { name, birth_date, avatar, } = doc.data();
                    info = { name, birth_date, avatar, key: doc.id };
                  })
                  if (info !== null) {
                    AsyncStorage.setItem('user', JSON.stringify(info))
                      .then(() => {
                        this.props.navigation.navigate('Info');
                      });
  
                  } else {
                    this.props.navigation.navigate('Sign');
                  }
                });
              })
        })
        .catch(err => {
          if(err.code=== 'auth/network-request-failed'){
            this.setState({errorConnect: true, loading: false});
          }
          else{
            this.setState({error: true, loading: false});
          }
         
        });
    }
  }

  componentDidMount() {
    //.createUserWithEmailAndPassword('iherrera@email.com', '123456789')
  }
  newAccount = () => {
    this.props.navigation.navigate('CreateUser');
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={(this.state.error) ? [styles.errorText] : [{ display: 'none' }]}>Wrong email or password</Text>
        <Text style={(this.state.errorConnect) ? [styles.errorText] : [{ display: 'none' }]}>{this.state.connectionFailed}</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          editable={!this.state.loading}
          placeholderTextColor={'#666666'}
          onChangeText={(text) => { this.setState({ 'email': text }) }}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          editable={!this.state.loading}
          placeholderTextColor={'#666666'}
          onChangeText={(text) => { this.setState({ 'password': text }) }}
        />
        <TouchableOpacity onPress={this.newAccount} style={styles.createTouch}>
          <Text style={styles.createText}>I don't have an account yet</Text>
        </TouchableOpacity>

        <MyButton onPress={this.login} disabled={this.state.loading} title={'Login'}/>
        
        <ActivityIndicator size="large" color="#000" animating={true} style={(this.state.loading) ? [styles.loading] : [styles.loadingoff]} />
      </View>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 90
  },
  title: {
    fontSize: 27,
    textAlign: 'center',
    margin: 10,
    color: "#000",
    fontFamily: "Lato-Bold"
  },
  createTouch: {
    width: 290,
    marginTop: 15,
    paddingVertical: 10,
  },
  createText: {
    fontSize: 18,
    textAlign: 'left',
    fontFamily: 'Lato-Bold',
    margin: 10,
    marginLeft: 5,
    color: '#2680EB'
  },
  btn: {
    width: 290,
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 20,
    marginTop: 50,
  },
  titleBtn: {
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Lato-Bold',
    margin: 10,
  },
  input: {
    marginTop: 20,
    width: 290,
    borderBottomWidth: 1,
    borderColor: '#000',
    fontSize: 20,
    fontFamily: "Lato-Regular"
  },
  signin: {
    fontSize: 20,
    fontFamily: "Lato-Regular",
    marginTop: 20,
    color: "#2680EB"
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
  loadingoff: {
    display: 'none'
  },
  errorText: {
    marginTop: 10,
    color: '#d9534f',
  },
  loginBtn: {
    width: 310,
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 60

  }
});
export default Login;