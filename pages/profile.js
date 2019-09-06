/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlob from 'react-native-fetch-blob';
import firebase from '../Firebase';
import { ScrollView } from 'react-native-gesture-handler';
import BottomBar from '../components/bottomBar';
import AlertCountdown from '../components/alertCountdown';
import MyButton from '../components/myButton';
const { height, width } = Dimensions.get('window');

type Props = {};
const originalXMLHttpRequest = window.XMLHttpRequest;
class Profile extends Component<Props> {
  constructor(props) {
    super(props);
    this.props.navigation;
    this.userRef = firebase.firestore().collection('users');
    this.userActive = JSON.parse(this.props.navigation.state.params.userActive);
  }
  state = {
    photo: null,
    loading: false,
    isLoading: true,
    alert: false,
  }
  static navigationOptions = {
    title: 'Account',
    headerStyle: {
    },
    headerTintColor: '#7E7E7E',
    headerTitleStyle: {
      color: "#7E7E7E",
      fontSize: 27,
      fontFamily: "Lato-Bold"
    },
  };

  handleChoosePhoto = () => {
    const options = {
      noData: true,
    }
    ImagePicker.launchImageLibrary(options, response => {
      if (response.uri) {
        this.setState({ photo: response })
      }
    })
  }
  deleteUser = () => {
    this.userRef.delete().then(r => {
      AsyncStorage.removeItem('user').then(() => {
        this.props.navigation.navigate('AuthLoading');
      });
    });

  }

  uploadPhoto = () => {
    this.setState({ loading: true });
    const image = this.state.photo.uri;

    const Blob = RNFetchBlob.polyfill.Blob
    const fs = RNFetchBlob.fs;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
    window.Blob = Blob


    let uploadBlob = null
    const imageRef = firebase.storage().ref('avatars').child(`${this.state.user.key}.jpg`);
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
      })
      .then((url) => {
        // URL of the image uploaded on Firebase storage
        window.XMLHttpRequest = originalXMLHttpRequest;
        firebase.firestore().collection('users').doc(this.state.user.key).update({ 'avatar': url }).then((r) => {
          let u = this.state.user;
          u['avatar'] = url;
          AsyncStorage.setItem('user', JSON.stringify(u)).then(() => {
            this.setState({ loading: false });
          });

        }).catch((e) => {
          alert(e);
          this.setState({ loading: false });
        });

      })
      .catch((error) => {
        this.setState({ loading: false });

      })
  }

  componentDidMount() {

    AsyncStorage.getItem('user').then((user) => {
      if (user) {
        u = JSON.parse(user);
        this.setState({ user: u, isLoading: false });
        this.userRef = this.userRef.doc(this.state.user.key);
      }
    }).catch((e) => { alert(e) });
  }
  render() {
    const { photo } = this.state;
    if (this.state.isLoading) {
      return (
        <ActivityIndicator size="large" color="#000" animating={true} style={[styles.loading]} />
      )
    }
    return (
      <View style={{ flex: 1 }}>
        <View>
          <ScrollView style={styles.container}>
            {photo !== null && (
              <View style={{ alignItems: 'center' }}>
                <Image
                  style={styles.avatar}
                  source={{ uri: photo.uri }}
                />
              </View>
            )}
            {
              (!photo && this.state.user.avatar !== null && this.state.user.avatar !== undefined) && (
                <View style={{ alignItems: 'center' }}>
                  <Image
                    style={styles.avatar}
                    source={{ uri: this.state.user.avatar }}
                  />
                </View>
              )
            }
            <View style={{ alignItems: 'center' }}>

              <MyButton style={{marginTop:40}} onPress={this.handleChoosePhoto} disabled={this.state.loading} title={'Change Photo'}/>

              {
                this.state.photo !== null && (
                  <MyButton style={{marginTop:40}} onPress={this.uploadPhoto} disabled={this.state.loading} title={'Save Photo'}/>
                )
              }
            </View>
            <ActivityIndicator size="large" color="#000" animating={true} style={(this.state.loading) ? [styles.loading] : [styles.loadingoff]} />
          </ScrollView>
        </View>
        <BottomBar
          userActive={this.userActive}
          user={this.state.user}
          alert={this.state.alert}
          alertFn={() => { this.setState({ alert: true }) }}
          navigation={this.props.navigation} />
        {
          this.userActive !== undefined && (
            <AlertCountdown visible={this.state.alert} onPress={() => { this.setState({ alert: false }) }} date={this.userActive.actual_birth} />
          )
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  avatar: {
    marginTop: 40,
    width: 200,
    height: 200,
    borderRadius: 100
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
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    fontFamily: 'Lato-Bold'
  },
});
export default Profile; 