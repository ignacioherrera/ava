/**
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {StyleSheet, Text, View, ScrollView,ActivityIndicator, TextInput, TouchableHighlight} from 'react-native';
import firebase from '../Firebase';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import MyButton from '../components/myButton';
import AsyncStorage from '@react-native-community/async-storage';

type Props = {};

class CreateUser extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password:'',
      error: false,
      loading: false,
      err: '',

    };
  }
  static navigationOptions = {
    title: 'Register'
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
 
  componentDidMount(){
  }  
  newAccount = ()=>{
    if(this.validate()){
      this.setState({loading: true});
      firebase.auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(res=>{ 
        const user = {'uid':res.user.uid, password: this.state.password, email:this.state.email};
        AsyncStorage.multiRemove(['initial', 'user']).then(()=>{
          AsyncStorage.setItem('auth', JSON.stringify(user))
          .then(()=>{
            this.props.navigation.navigate('Initial');
          })
        });
        
      }).catch(err=>{
        this.setState({err: err.message});
        this.setState({loading: false});
      });  
  }
}
  render() {
    return ( 
        <View style={styles.container}>
        <Text style={(this.state.error ) ? [styles.errorText] : [{display: 'none'}]}>Wrong email or password</Text>
        <Text style={(this.state.err!=='' ) ? [styles.errorText] : [{display: 'none'}]}>{this.state.err}</Text>

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
        <MyButton style={{marginTop:30}} onPress={this.newAccount} disabled={this.state.loading} title={'Create'}/>

        <ActivityIndicator size="large" color="#000" animating={true} style={(this.state.loading) ? [styles.loading] : [styles.loadingoff]} />
      </View>
      
    )
  }   
}   

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60
  },
  title: {
    fontSize: 27,
    textAlign: 'center',
    margin: 10,
    color: "#000",
    fontFamily: "Lato-Bold"
  },
  input: {
    marginTop: 20,
     width: 290,
     borderBottomWidth: 1,
     borderColor: '#000',
     fontSize: 20,
     fontFamily: "Lato-Regular"
  },
  signin:{
    fontSize: 20,
    fontFamily: "Lato-Regular",
    marginTop:20,
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
  loadingoff:{
    display: 'none'
  },
  errorText:{
    marginTop: 10,
    color: '#d9534f',
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
});
export default CreateUser;