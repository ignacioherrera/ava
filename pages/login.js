/**
 * @format
 * @flow
 */
import React, {Component} from 'react';
//import firebase from '../firebase';
import {StyleSheet, Text, View,ActivityIndicator, TextInput, TouchableHighlight} from 'react-native';
type Props = {};
class Login extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password:'',
      error: false,
      loading: false
    };
  }
  signIn = ()=>{
    this.setState({loading: true});
    let obj = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'email': this.state.email,
        'password': this.state.password
      })
    };
    /*fetch(apiUrl+"login", obj)
      .then((res) =>{
        console.log(res);
        return res.json();
      })
      .then((resJson)=> {
        console.log(resJson);
        if(resJson.error=== undefined ){
          this.setState({loading:false});
          Keychain.setGenericPassword(this.state.email, this.state.password).then(
            ()=>{
              Keychain.setInternetCredentials('token', this.state.email, resJson.success).then(
                  ()=>this.props.navigation.navigate('AuthLoading')
              );
          }
          );
        }
        else{
          this.setState({error:true});
          this.setState({loading:false});
        }
      })
      .catch((error) => {
        console.error(error);
      });*/
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, {marginBottom: 30}]}>Welcome</Text> 
        <TextInput
          style={styles.input}
          placeholder="Email"
          editable={!this.state.loading} 
          onChangeText={(text)=>{this.setState({'email': text})}}
        />
        <TextInput
          style={[styles.input,{marginBottom: 20}]}  
          secureTextEntry={true}
          editable={!this.state.loading} 
          placeholder="Pass"
          onChangeText={(text)=>{this.setState({'password': text})}}
        />
        <Text style={(this.state.error)?[styles.errorText,{marginBottom:20}]:[{display:'none'}]}>Wrong Credentials!</Text> 
        <TouchableHighlight
         style={styles.loginBtn}
         onPress={this.signIn}>
         <Text style={[styles.title, {color: "#fff"}]}>Login</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={()=>{this.props.navigation.navigate('Sign');}}>
        <Text style={[styles.signin]}>Become a member Sign in!</Text>
        </TouchableHighlight>
        
        <ActivityIndicator size="large" color="#000" animating={true} style={(this.state.loading)? [styles.loading]: [styles.loadingoff] }/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  loginBtn:{
    width: 310,
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 60

  }
});
export default Login;