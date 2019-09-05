/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-swiper';
import AsyncStorage from '@react-native-community/async-storage';
type Props = {};
class Initial extends Component<Props> {
  constructor(props) {
    super(props);
    this.state= {
      prevSlide: 0,
      isLoading: false
    }
  }
  static navigationOptions = {
    header: null
  }
  changeIndex = (newIndex)=>{
    if(newIndex === 0 && this.state.prevSlide=== 2){
      this.setState({isLoading: true});
      AsyncStorage.setItem('initial', JSON.stringify(true)).then(() => {
        this.props.navigation.navigate('Sign');
      }).catch(() => { this.setState({isLoading: falses}); });

    }
    else { 
      this.setState({'prevSlide': newIndex});
    }
  } 
  render(){
    if (this.state.isLoading) {
      return (
        <View style={styles.activity}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    }
    return (
      <Swiper style={styles.wrapper} onIndexChanged={this.changeIndex} showsButtons={false} activeDotStyle={{backgroundColor:'#000'}}>
        <View style={styles.slide}>
          <Text style={styles.text}>Select an event</Text>
        </View>
        <View style={styles.slide}>
          <Text style={styles.text}>Suggest and vote for a gift</Text>
        </View>
        <View style={styles.slide}>
          <Text style={styles.text}>Enjoy buying it to your friend.</Text>
        </View>
      </Swiper>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Lato-Bold',
    fontWeight: 'bold'
  }
});
export default Initial;