/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, ScrollView, View, TextInput, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import DatePicker from 'react-native-date-picker';
import firebase from '../Firebase';
import AsyncStorage from '@react-native-community/async-storage';
import { logoIcon } from '../images';
import MyButton from '../components/myButton';
type Props = {};
class Sign extends Component<Props> {
  constructor(props) {
    super(props);
    this.props.navigation
    this.ref = firebase.firestore().collection('users');
    this.state = {
      name: '',
      birth_date: new Date(),
      isLoading: false,
      error: '',
      loading: false,
      auth: null,
    };
    this.state = {
      loading: false,
    };
  }
  static navigationOptions = {
    header: null
  }
  componentDidMount() {
    AsyncStorage.getItem('auth').then(auth => {
      const { uid } = JSON.parse(auth);
      this.setState({ auth: uid });
    })
  }
  formatDate = (d) => {
    month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }
  save = () => {
    this.setState({
      loading: true,
    });
    if (this.state.name === '' || this.state.name === undefined) {
      this.setState({ error: 'The name is required' });
      this.setState({
        loading: false,
      });
      return;
    }
    if (this.state.birth_date === '' || this.state.birth_date === undefined) {
      this.setState({ error: 'The birthdate is required' });
      this.setState({
        loading: false,
      });
      return;
    }
    this.setState({
      loading: false,
    });
    try {
      this.ref.add({
        name: this.state.name,
        birth_date: this.formatDate(this.state.birth_date),
        uid: this.state.auth
      }).then((docRef) => {
        user = {
          key: docRef.id,
          name: this.state.name,
          birth_date: this.formatDate(this.state.birth_date),
          uid: this.state.auth
        }
        this.setState({
          name: '',
          birth_date: new Date(),
          isLoading: false,
        });
        AsyncStorage.setItem('user', JSON.stringify(user)).then(() => {
          this.props.navigation.navigate('Info');
        }).catch(() => { });
      })
        .catch((error) => {
          this.setState({
            error: error,
            isLoading: false,
          });
        });
    }
    catch (error) {
      alert('No internet Connection');
    }
  }
  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.activity}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={{
            alignItems: 'center'
          }}>
          <Image
          style={styles.avatar}
          source={logoIcon}
        />

<Text style={styles.title}>Welcome to Ava</Text>
        <Text style={(this.state.error !== '') ? [styles.errorText] : []}>{this.state.error}</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          editable={!this.state.loading}
          placeholderTextColor={'#666666'}
          onChangeText={(text) => { this.setState({ 'name': text }) }}
        />
        <Text style={(this.state.nameError !== '') ? [styles.errorText] : []}>{this.state.nameError}</Text>

        <DatePicker
          style={{ width: 380, height: 28, marginTop:30}}
          mode={'date'}
          maximumDate={new Date()}
          date={this.state.birth_date}
          onDateChange={birth_date => this.setState({ birth_date })}
        />

        <MyButton title={'Create'} onPress={this.save} style={{marginVertical: 60}} disabled={this.state.loading}/>
          </View>
        
        

        <ActivityIndicator size="large" color="#000" animating={true} style={(this.state.loading) ? [styles.loading] : [styles.loadingoff]} />
        </ScrollView>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  avatar: {
    marginTop: 40,
    width: 100,
    height: 100,
    borderRadius: 50
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'Lato-Bold',
    fontWeight: 'bold'
  },
  titleBtn: {
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Lato-Bold',
    margin: 10,
  },
  label: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
    textAlign: 'left',
    width: 290,
    marginVertical: 10,
    color: '#666666'
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
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 20,
    marginTop: 60,
  }
});
export default Sign;