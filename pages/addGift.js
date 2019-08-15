/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, ScrollView, Text, View, TextInput, TouchableHighlight, ActivityIndicator} from 'react-native';
import firebase from '../Firebase';
import AsyncStorage from '@react-native-community/async-storage';
type Props = {};
class NewGift extends Component<Props> {
  constructor(props) {
    super(props);
    this.props.navigation
    this.forUser = JSON.parse(this.props.navigation.getParam('user'));
    this.ref = firebase.firestore().collection('gifts');
    this.refMessages = firebase.firestore().collection('messages');
    this.state = {
      link: '',
      date: null,
      for_user: false,
      name: '',
      nameError: '',
      creator: null,
      price: '',
      description: '',
      isLoading: false,
      users: [],
      loading: false,
      descriptionError: '',
      linkError: '',
      priceError: ''
    };
  }
  static navigationOptions ={
    header: null
  }
  componentDidMount() {
  }
  save = () => {
    this.setState({
      isLoading: true,
    });
    if (!this.validate()) {
      this.setState({
        isLoading: false,
      });
    }
    else {
      let currentUser = null;
      AsyncStorage.getItem('user').then((user) => {
        try {
          currentUser = JSON.parse(user);
          this.ref.add({
            creator: currentUser,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            for_user: this.forUser,
            name: this.state.name,
            description: this.state.description,
            link: this.state.link.toLowerCase(),
            price: this.state.price,
            vote_counter: 0,
          }).then((docRef) => {
            const text = `I suggest a gift\n ${this.state.link} \n ${(this.state.description !== '') ? this.state.description : ''} \n please go to the info section and vote!!!`

            const message = {
              text: text,
              user: {
                _id: currentUser.key,
                name: currentUser.name
              },
              _id: this.refMessages.doc().id,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              for_user: {
                key: this.forUser.key,
                name: this.forUser.name
              },
              birth_date: this.forUser.actual_birth
            };
            this.refMessages.add(message).then(() => {
              this.props.navigation.goBack();
            }).catch((e) => {
              alert(e);

            });
          })
            .catch((error) => {
              console.log("Error adding document: ", error);
              this.setState({
                error: error,
                isLoading: false,
              });
            });
        }
        catch (error) {
          alert('No internet Connection' + error);
        }
      }).catch(() => { alert('Problem with the user stored in the phone') });
    }
  }
  validate() {
    const regPrice = /^\d{0,8}(\.\d{1,4})?$/;
    const regUrl = /^(ftp|https?):\/\/+(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
    
    if(this.state.name=== ''){
      this.setState({ nameError: "You have to write a name" });
      return false;  
    }
    else {
      this.setState({ linkError: "" });
    }
    if (this.state.link === '') {
      this.setState({ linkError: "You have to add a link" });
      return false;
    }
    else{
      if (!regUrl.test(this.state.link)){
        this.setState({ linkError: "Invalid link" });
        return false;
      } else this.setState({ linkError: "" });
    }
    if (!regPrice.test(this.state.price) || this.state.price === '') {
      this.setState({ priceError: "You have to add a valid price" });
      return false;
    }
    else{
      this.setState({ priceError: "" });
    }
    return true;
  }

  render() {
    return (
      <ScrollView>
        <View style={styles.container}>
        <TextInput
            style={styles.input}
            placeholder="Name"
            onChangeText={(text) => { this.setState({ 'name': text }) }}
          />
          <TextInput
            style={styles.input}
            textContentType={'URL'}
            placeholder="Link"
            onChangeText={(text) => { this.setState({ 'link': text }) }}
          />
          <Text style={(this.state.linkError !== '') ? [styles.errorText] : []}>{this.state.linkError}</Text>
          <TextInput
            placeholder="Price"
            style={styles.input}
            keyboardType={'numeric'}
            onChangeText={(text) => { this.setState({ 'price': text }) }}
          />
          <Text style={(this.state.priceError !== '') ? [styles.errorText] : []}>{this.state.priceError}</Text>
          <TextInput
            style={styles.input}
            placeholder="Description"
            multiline={true}
            numberOfLines={3}
            onChangeText={(text) => this.setState({ 'description': text })}
            value={this.state.description}
            editable={!this.state.loading}
          />
          <Text style={(this.state.descriptionError !== '') ? [styles.errorText] : []}>{this.state.descriptionError}</Text>


          <TouchableHighlight style={styles.btn} onPress={this.save} disabled={this.state.isLoading}>
            <Text style={[styles.titleBtn, { color: "#fff" }]}>Create</Text>
          </TouchableHighlight>
          <ActivityIndicator size="large" color="#000" animating={true} style={(this.state.isLoading) ? [styles.loading] : [styles.loadingoff]} />
        </View>
      </ScrollView>
    ); 
  }
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
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
    borderColor: '#666666',
    fontSize: 18,
    fontFamily: "Lato-Regular"
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
    color: '#d9534f'
  },
  
  btn: {
    width: 290,
    backgroundColor: "#26EB96",
    borderRadius: 10,
    paddingVertical: 20,
    marginTop: 60,
  },
});
export default NewGift;