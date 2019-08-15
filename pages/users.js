/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, Linking, Dimensions, FlatList, Image, TouchableHighlight, ActivityIndicator } from 'react-native';
import firebase from '../Firebase';
import {  profileIcon } from '../images';
import AsyncStorage from '@react-native-community/async-storage';
type Props = {};
const { height, width } = Dimensions.get('window');
class Users extends Component<Props> {
    constructor(props) {
        super(props); 
        this.props.navigation;
        this.refUsers = firebase.firestore().collection('users');
        this.usersSubscription = null;
        this.state = {
            users: [],
            isLoading: true,
        };

    }
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        console.log('el avatar', params.avatar);
        return {
            headerTitle: (
                <View style={styles.headerTitle}>
                    <Text style={styles.title}>Users registered</Text>
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
    onUsersUpdate = (querySnapshot) => {
        const users = [];
        querySnapshot.forEach((user) => {
            const { name, birth_date, avatar, email } = user.data();
            users.push({
                key: user.id,
                name,
                email,
                birth_date,
                avatar
            });
        });
        this.setState({
            users,
            isLoading: false
        });
    }

    renderItem = ({ item, index }) => {
        return (
            <View style={[styles.itemGenericView]}>
            <Image  style={styles.itemAvatar} source={(item.avatar) ? { uri: item.avatar } : profileIcon} style={{ width: 40, height: 40, borderRadius: 20 }} /> 
                <Text style={styles.itemText}>{item.name}</Text>
            </View>
        );
    };

    componentDidMount() {
            this.usersSubscription = this.refUsers.onSnapshot(this.onUsersUpdate, (error) => {
                alert('Firebase connection error')
            });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#000" animating={true} style={[styles.loading]} />
                </View>
            );
        }
        return (
            <FlatList
                style={styles.conatiner}
                data={this.state.users}
                renderItem={item => this.renderItem(item)}
            />
        ); 
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    }, 
    itemGenericView: {
        flexDirection: 'row',
        alignItems: 'flex-start', 
        justifyContent: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 10, 

    },
    itemAvatar:{ 
        display:'flex',
        width: 40
    }, 
    itemText: {
    
        fontFamily: 'Lato-Regular',
        fontSize: 14,
        marginTop: 15,
        marginLeft: 10

    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontFamily: 'Lato-Bold',
        fontSize: 18,
        marginLeft: 5
    },

});
export default Users;