/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, ScrollView, Text, View, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import firebase from '../Firebase';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob'; 
import AsyncStorage from '@react-native-community/async-storage';
import BottomBar from '../components/bottomBar';
import AlertCountdown from '../components/alertCountdown';
import MyButton from '../components/myButton';

const { height, width } = Dimensions.get('window');
type Props = {};
const originalXMLHttpRequest = window.XMLHttpRequest;
class NewGift extends Component<Props> {
  constructor(props) {
    super(props);
    this.props.navigation;
    this.forUser = JSON.parse(this.props.navigation.state.params.userActive);
    console.log(this.forUser);
    this.ref = firebase.firestore().collection('gifts');
    this.refMessages = firebase.firestore().collection('messages');
    this.state = {
      link: '',
      photo: null,
      date: null,
      for_user: false,
      name: '',
      nameError: '',
      creator: null,
      price: '',
      isLoading: false,
      users: [],
      loading: false,
      linkError: '',
      priceError: '',
      alert: false,
    };
  }
  static navigationOptions = {
    header: null
  }
  componentDidMount() {
    AsyncStorage.getItem('user').then((user) => {
      if (user) { 
        us = JSON.parse(user);
        this.setState({ user: { _id: us.key, name: us.name, avatar: us.avatar } });
      } 
    });
  }
  handleChoosePhoto = () => {
    const options = { 
      noData: true,
    }
    ImagePicker.launchImageLibrary(options, response => {
      console.log(response);
      if (response.uri) {
        this.setState({ photo: response }, () => {
        });
      }
    })
  }
  nameGen = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  uploadPhoto = (currentUser) => {
    const image = this.state.photo.uri;
    const Blob = RNFetchBlob.polyfill.Blob;
    const fs = RNFetchBlob.fs;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;
    let uploadBlob = null;
    const name = this.state.photo.fileName.split('.');
    console.log(this.nameGen + '.' + name[name.length - 1]);
    const imageRef = firebase.storage().ref('gifts').child(this.nameGen() + '.' + name[name.length - 1]);
    let mime = 'image/jpg';
    fs.readFile(image, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
      })
      .then((blob) => {
        uploadBlob = blob;
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL();
      }).then((url) => {
        window.XMLHttpRequest = originalXMLHttpRequest;
        this.ref.add({
          creator: currentUser,
          date: firebase.firestore.FieldValue.serverTimestamp(),
          for_user: this.forUser,
          name: this.state.name,
          link: this.state.link.toLowerCase(),
          price: this.state.price,
          photo: url,
          vote_counter: 0,
        }).then((docRef) => {
          const text = `I suggest a gift\n ${this.state.link}`;
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
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isloading: false });
      })
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
          if (this.state.photo !== null) {
            this.uploadPhoto(currentUser);
          }
          else {
            this.ref.add({
              creator: currentUser,
              date: firebase.firestore.FieldValue.serverTimestamp(),
              for_user: this.forUser,
              name: this.state.name,
              link: this.state.link.toLowerCase(),
              price: this.state.price,
              vote_counter: 0,
            }).then((docRef) => {
              const text = `I suggest a gift\n ${this.state.link}`;
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

        }
        catch (error) {
          alert('No internet Connection' + error);
          this.setState({ isLoading: false });
        }
      }).catch(() => { alert('Problem with the user stored in the phone') });
    }
  }
  validate() {
    const regPrice = /^\d{0,8}(\.\d{1,4})?$/;
    const regUrl = /^(ftp|https?):\/\/+(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;

    if (this.state.name === '') {
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
    else {
      if (!regUrl.test(this.state.link)) {
        this.setState({ linkError: "Invalid link" });
        return false;
      } else this.setState({ linkError: "" });
    }
    if (!regPrice.test(this.state.price) || this.state.price === '') {
      this.setState({ priceError: "You have to add a valid price" });
      return false;
    }
    else {
      this.setState({ priceError: "" });
    } 
    return true; 
  } 

  render() {
    return (
      <View style={{flex:1}}>
        <View style={{marginBottom: 60}}>
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
              <Text style={(this.state.linkError !== '') ? [styles.errorText] : [{display:'none'}]}>{this.state.linkError}</Text>
              <TextInput
                placeholder="Price"
                style={styles.input}
                keyboardType={'numeric'}
                onChangeText={(text) => { this.setState({ 'price': text }) }}
              />
              <Text style={(this.state.priceError !== '') ? [styles.errorText] : []}>{this.state.priceError}</Text>
              {
                this.state.photo !== null && (
                  <View style={{ alignItems: 'center', maxHeight: 200 }}>
                    <Image
                      style={styles.photo}
                      source={{ uri: this.state.photo.uri }}
                    />
                  </View>
                )
              } 

              <MyButton style={{marginTop: 20}} onPress={this.handleChoosePhoto} disabled={this.state.loading} title={(this.state.photo === null) ? 'Open Gallery' : 'Change Photo'}/>
              <MyButton style={{marginTop: 30}} 
              onPress={this.save} 
              disabled={this.state.isloading} title={'Create'}/>

              <ActivityIndicator size="large" color="#000" animating={true} style={(this.state.isLoading) ? [styles.loading] : [styles.loadingoff]} />
            </View>
          </ScrollView>
        </View>
        <BottomBar
          userActive={this.forUser}
          user={this.state.user}
          alert={this.state.alert}
          alertFn={() => { this.setState({ alert: true }) }}
          navigation={this.props.navigation} />
          {
            this.forUser!==undefined && (
              <AlertCountdown visible={this.state.alert} onPress={() => { this.setState({ alert: false }) }} date={this.forUser.actual_birth} />
            )
          }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  photo: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: 'contain',
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
    borderColor: 'rgba(0,0,0,0.5)',
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
  }
});
export default NewGift;