/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, Modal, Button, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import firebase from '../Firebase';
import AsyncStorage from '@react-native-community/async-storage';
import AlertCountdown from '../components/alertCountdown';
import BottomBar from '../components/bottomBar';
type Props = {};

const { height, width } = Dimensions.get('window');
class Home extends Component<Props> {
  constructor(props) {
    super(props);
    this.props.navigation;
    this.userActive = JSON.parse(this.props.navigation.state.params.userActive);
    this.refUsers = firebase.firestore().collection('users');
    this.refmessages = firebase.firestore().collection('messages').where('for_user.key', '==', this.userActive.key).where('birth_date', '==', JSON.parse(JSON.stringify(this.userActive.actual_birth)));
    this.messagesSubscription = null;
    this.usersSubscription = null
    this.state = {
      users: [],
      user: null,
      alert: false,
      isLoading: true,
    };
  }
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: (
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{(params.name) ? params.name + "'s Birthday" : ''}</Text>

        </View>
      ),
      headerStyle: {
      },
      headerTintColor: '#7E7E7E',
      headerTitleStyle: {
        color: "#7E7E7E",
        fontSize: 22,
        fontFamily: "Lato-Bold"
      },
    }
  };
  createGift = () => {
    const { name, actual_birth, key } = this.userActive;
    console.log(this.userActive);
    this.props.navigation.navigate('NewGift', {
      user: JSON.stringify({ name, actual_birth, key })
    });
  };
  onUsersUpdate = (querySnapshot) => {
    const users = [];
    querySnapshot.forEach((user) => {
      const { name, birth_date, avatar } = user.data();
      users.push({
        key: user.id,
        name,
        birth_date,
        avatar
      });
    });
    this.setState({
      users,
      isLoading: false,
    });
    this.props.navigation.setParams({
      name: this.userActive.name.split(' ')[0]
    });
    if (this.messagesSubscription !== null) this.messagesSubscription();
    this.messagesSubscription = this.refmessages.onSnapshot(this.onCollectionUpdate);
  }

  renderItem = ({ item, index }) => {
    return (
      <View style={[styles.itemGenericView]}>
        <Text style={styles.itemText}>{item.name}</Text>
      </View>
    );
  };

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((m) => {

      messages.push(
        this.parse(m)
      );
      messages.sort(function (a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    });
    console.log('los mensajes', messages);
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
    if (numberStamp) timestamp = numberStamp.toDate();
    // 3.
    let u = this.state.users.find(us => us.key === user._id);
    let us = user;
    if (u !== undefined) {

      console.log('el avatar del user', u);
      us.avatar = u.avatar;
    }
    const message = {
      _id,
      timestamp,
      text,
      user: us,
    };
    return message;
  }
  componentDidMount() {

    AsyncStorage.getItem('user').then((user) => {
      if (user) {
        u = JSON.parse(user);
        console.log('el user del async storage', u);
        this.setState({ user: { _id: u.key, name: u.name, avatar: u.avatar } });
        this.usersSubscription = this.refUsers.onSnapshot(this.onUsersUpdate, (error) => {
          alert('Firebase connection error');
        });
        this.props.navigation.setParams({ avatar: this.state.user.avatar });
        this.willFocusSubscription = this.props.navigation.addListener(
          'didFocus',
          payload => {
            AsyncStorage.getItem('user').then((user) => {
              if (user) {
                us = JSON.parse(user);
                console.log('el user del async storage didfocus', us);
                this.setState({ user: { _id: us.key, name: us.name, avatar: us.avatar } });
                this.props.navigation.setParams({ avatar: this.state.user.avatar });
              }
            });
            console.log('oe esto entro al focus');
          }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
          'willBlur',
          payload => {
            console.log('Se fue el home');
          }
        );
      }
    }).catch((e) => { alert(e) });
  }
  send = (messages) => {
    try {
      for (let i = 0; i < messages.length; i++) {
        const { text, user, _id } = messages[i];
        const for_user = this.state.users[0];
        if (user.avatar === undefined) user.avatar = null;
        const message = {
          text,
          user,
          _id,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          for_user: {
            key: this.userActive.key,
            name: this.userActive.name,
          },
          birth_date: this.userActive.actual_birth

        };
        console.log('add message ', messages);
        console.log('add message server', message);
        firebase.firestore().collection('messages').add(message).then(() => {

        }).catch((e) => {
          alert(e);
        });
      }
    }
    catch (e) {
      alert(e);
    }

  };
  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#000" animating={true} style={[styles.loading]} />
        </View>
      );
    }
    if (this.state.block) {
      return (
        <View style={styles.container}>
          <Text style={styles.blockText}>Your friends are planning an awesome event for you here</Text>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <GiftedChat
          messages={this.state.messages}
          onSend={this.send}
          user={this.state.user}
        />
        <View style={{ height: 65 }}></View>
        <BottomBar
          userActive={this.userActive}
          user={this.state.user}
          alert={this.state.alert}
          alertFn={() => { this.setState({ alert: true }) }}
          navigation={this.props.navigation} />
        {
          this.userActive !== undefined && (
            <AlertCountdown containerStyle={{marginTop: -60}} visible={this.state.alert} onPress={() => { this.setState({ alert: false }) }} date={this.userActive.actual_birth} />
          )
        }
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
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  blockText: {
    paddingHorizontal: 10,
    textAlign: 'center'
  },
  title: {
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    marginLeft: 5
  },
  bottomBar: {
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    width: width
  },
  userLink: {
    marginTop: 5,
    marginLeft: 5
  }

});
export default Home;