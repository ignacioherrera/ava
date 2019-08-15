/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, ActivityIndicator } from 'react-native';
import DatePicker from 'react-native-date-picker';
import firebase from '../Firebase';
import AsyncStorage from '@react-native-community/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
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
    };
    this.state = {
      loading: false,
    };
  }
  static navigationOptions = {
    header: null
  }
  formatDate = (d) =>{
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
    console.log('entor ljljlj', this.state.name, this.state.birth_date);
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
      }).then((docRef) => {
        console.log('respuesta al crear user', docRef);
        user = {
          key: docRef.id,
          name: this.state.name,
          birth_date: this.formatDate(this.state.birth_date),
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
          console.log("Error adding document: ", error);
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
        <Text style={styles.title}>Welcome</Text>
        <Text style={(this.state.error !== '') ? [styles.errorText] : []}>{this.state.error}</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          editable={!this.state.loading}
          placeholderTextColor={'#666666'}
          onChangeText={(text) => { this.setState({ 'name': text }) }}
        />
        <Text style={(this.state.nameError !== '') ? [styles.errorText] : []}>{this.state.nameError}</Text>

        <Text style={styles.label}>Birthday</Text>
        <DatePicker
          style={{ width: 290 }}
          mode={'date'}
          maximumDate={new Date()}
          date={this.state.birth_date}
          onDateChange={birth_date => this.setState({ birth_date })}
        />
        <TouchableHighlight style={styles.btn} onPress={this.save} disabled={this.state.loading}>
          <Text style={[styles.titleBtn, { color: "#fff" }]}>Create</Text>
        </TouchableHighlight>
        <ActivityIndicator size="large" color="#000" animating={true} style={(this.state.loading) ? [styles.loading] : [styles.loadingoff]} />
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
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'Lato-Bold'
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
    marginVertical: 5
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
  }
});
export default Sign;