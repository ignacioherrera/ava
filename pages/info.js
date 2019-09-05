/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, Dimensions, FlatList, Image, TouchableHighlight, TouchableOpacity, ActivityIndicator } from 'react-native';
import firebase from '../Firebase';
import GiftsInfo from '../components/GiftsInfo';
import AsyncStorage from '@react-native-community/async-storage';
import AlertCountdown from '../components/alertCountdown';
import BottomBar from '../components/bottomBar';
type Props = {};
const { height, width } = Dimensions.get('window');
class Info extends Component<Props> {
    constructor(props) {
        super(props);
        this.props.navigation;
        this.refUsers = firebase.firestore().collection('users');
        this.usersSubscription = null;
        this.state = {
            users: [],
            alert: false,
            refresh: false,
            refreshUsers: false,
            isLoading: true,
            loadingGifts: true,
            payState: false,
            userActive: null,
            indexActive: null,
            daysToCloseVotation: 0,
            daysToBirthday: 0,
            timeToBirthday: 0
        };
    }
    checkPayDates(a, b) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        const difference = Math.floor((utc2 - utc1) / _MS_PER_DAY);

        this.setState({
            daysToBirthday: difference,
            daysToCloseVotation: difference - 5,
        });

        return false;
    }
    static navigationOptions = {
        header: null
    }
    /*static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            headerTitle: (
                <Text style={[styles.title, {
                    textAlign: 'center',
                    flexGrow: 1,
                    alignSelf: 'center'
                }]}>Birthdays</Text>
            ), 
            headerLeft: (
            <View style={[styles.headerTitle, { flex: 3 }]}>
                <TouchableOpacity onPress={() => { navigation.navigate('Profile') }} style={{ paddingHorizontal: 5, paddingVertical: 7 }} ><Image source={homeIcon} style={{ width: 18, height: 19, marginTop: 5, marginLeft: 5 }} /></TouchableOpacity>
            </View>),//add this
            headerRight: (
                <View style={[styles.headerTitle, { flex: 1 }]}>
                    <TouchableOpacity onPress={() => { navigation.navigate('Profile') }} style={{ paddingHorizontal: 5, paddingVertical: 7 }} ><Image source={moreIcon} style={{ width: 25, height: 6, marginTop: 5, marginLeft: 5 }} /></TouchableOpacity>
                </View>

            ),
            headerStyle: {
            },
            headerTintColor: '#666666',
            headerTitleStyle: {
                color: "#666666",
                fontSize: 22,
                fontFamily: "Lato-Bold"
            },
        }
    };*/
    onUsersUpdate = (querySnapshot) => {
        const users = [];
        const today = new Date();
        querySnapshot.forEach((user) => {
            const { name, birth_date, avatar, } = user.data();
            const birth = birth_date.split('-');
            const year = new Date().getFullYear();
            actual_birth = new Date(year, parseInt(birth[1]) - 1, birth[2]);
            if (today > actual_birth) {
                actual_birth = new Date(year + 1, parseInt(birth[1]) - 1, birth[2]);
            }
            users.push({
                key: user.id,
                name,
                birth_date,
                actual_birth,
                avatar
            });
        });
        users.sort(function (a, b) {
            return new Date(a.actual_birth) - new Date(b.actual_birth);
        });
        this.setState({
            users
        });
        if (this.state.users[0]) {

            //Si es la primera vez que se carga toma el primer user de la lista.
            if (this.state.userActive === null && this.state.users.length > 0) {
                this.setState({ userActive: this.state.users[0], indexActive: 0, isLoading: false });
                const first = users[0];
                this.checkPayDates(today, this.state.userActive.actual_birth);
            }
        }
    }
    checkVotes = (key) => {
        const r = this.state.votes.find(k => k.gift_key === key);
        if (r !== undefined) return true;
        return false;
    }
    goChat = () => {
        console.log('lo que mando para el chat', this.state.userActive);
        this.props.navigation.navigate('Home', { userActive: JSON.stringify(this.state.userActive),  });
    }
    renderUser = ({ item, index }) => {
        let css = [styles.userItem];
        let textStyle = [styles.userTitle];
        // if (index === this.state.indexActive + 1) css = [styles.userItemRight];
        // if (index === this.state.indexActive - 1) css = [styles.userItemLeft];
        if (index === this.state.indexActive){
            css = [styles.userItemActive];
            textStyle.push(styles.userTitleActive);
        } 

        return (
            <View style={styles.itemViewParent}>
                <TouchableOpacity style={css} onPress={() => { this.changeUserActive(item, index) }}>
                    <Text style={textStyle}>{item.name.split(' ')[0]}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    changeUserActive = (item, index) => {
        const today = new Date();
        if (item.key !== this.state.userActive.key) {
            const u = item;
            this.setState({ userActive: u, loadingGifts: true, indexActive: index, refresh: !this.state.refresh, refreshUsers: !this.state.refreshUsers }, () => {
                this.checkPayDates(today, this.state.userActive.actual_birth);
            });
        }
    }
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'didFocus',
            payload => {
                AsyncStorage.getItem('user').then((user) => {
                    if (user) {
                        us = JSON.parse(user);
                        this.setState({ user: { _id: us.key, name: us.name, avatar: us.avatar } });
                        this.props.navigation.setParams({ avatar: this.state.user.avatar });
                    }
                });
            }
        );
        AsyncStorage.getItem('user').then((user) => {
            if (user) {
                u = JSON.parse(user);
                this.setState({ user: u }, () => {
                    this.props.navigation.setParams({ avatar: u.avatar });
                    this.usersSubscription = this.refUsers.onSnapshot(this.onUsersUpdate, (error) => {
                        alert('Firebase connection error')
                    });
                });
            }
        }).catch((e) => { alert(e) });
    }
    createGift = () => {
        const { name, actual_birth, key } = this.state.userActive;
        this.props.navigation.navigate('NewGift', {
            user: JSON.stringify({ name, actual_birth, key })
        });
    };
    reloadUsers = () => {
        this.setState({ refreshUsers: !this.state.refreshUsers });
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
            <View style={styles.container}>
                <FlatList
                    style={styles.usersList}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    extraData={this.state.refreshUsers}
                    data={this.state.users}
                    renderItem={item => this.renderUser(item)}
                />
                { 
                    this.state.userActive !== undefined && this.state.userActive !== null && this.state.user !== undefined && this.state.daysToBirthday !== undefined && (
                        <GiftsInfo user={this.state.user} navigation={this.props.navigation} userActive={this.state.userActive} users={this.state.users} daysToBirthday={this.state.daysToBirthday}></GiftsInfo>
                    )
                }
                <BottomBar 
                userActive={this.state.userActive}  
                user={this.state.user} 
                alert={this.state.alert} 
                alertFn={()=>{this.setState({alert:true})}}
                navigation={this.props.navigation}/>
                <AlertCountdown onFinish={this.reloadUsers} visible={this.state.alert} onPress={()=>{this.setState({alert: false})}} date={JSON.parse(JSON.stringify(this.state.userActive.actual_birth))}/>
            </View>)
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    addBtn: {
        position: 'absolute',
        display: 'flex',
        right: 18,
        bottom: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatBtn: {
        position: 'absolute',
        display: 'flex',
        left: 18,
        bottom: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    usersList: {
        marginTop: 10,
        maxHeight: 40,
        minHeight: 40,
        marginLeft: 30
    },
    userTitle: {
        fontFamily: 'Lato-Bold',
        fontSize: 18,
        textAlign: 'center'
    },
    userTitleActive:{
        fontWeight: 'bold'
    },
    userItem: {
        backgroundColor: '#fff',
        paddingVertical: 3,
        paddingHorizontal: 28,
        minWidth: (width / 2) - 30,
        borderWidth: 1,
        borderColor: '#fff'
    },
    userItemActive: {
        backgroundColor: '#fff',
        paddingVertical: 3,
        paddingHorizontal: 15,
        minWidth: (width / 2) - 30,
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 20
    },
    itemViewParent: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: '#fff'
    },
    remain: {
        fontSize: 33,
        fontFamily: 'Lato-Bold',
        paddingHorizontal: 10,
        textAlign: 'center',
        color: '#EB2626',
        marginTop: 20
    },
    giftName: {
        fontFamily: 'Lato-Bold',
        fontSize: 24,
        marginBottom: 5,
        textAlign: 'center',
        color: '#666666'
    },
    giftDescription: {
        fontSize: 18,
        fontFamily: 'Lato-Regular',
        textAlign: 'center',
        color: '#666666'
    },
    voteButton: {
    },
    giftList: {
        marginTop: 15
    },
    giftLink: {
        fontSize: 19,
        fontFamily: 'Lato-Regular',
        color: '#2680EB',
        textDecorationLine: 'underline',
        textAlign: 'center'
    },
    titleBtn: {
        fontSize: 22,
        textAlign: 'center',
        fontFamily: 'Lato-Bold',
        margin: 10,
        color: '#fff'
    },
    btn: {
        width: 290,
        backgroundColor: "#26EB96",
        borderRadius: 10,
        paddingVertical: 20,
        marginTop: 60,
    },
    giftView: {
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: "#fff",
        shadowColor: "rgba(0,0,0,0.16)",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2,
        elevation: 3,
        marginHorizontal: 30,
        marginVertical: 12,
        paddingVertical: 20,
        paddingHorizontal: 20
    },
    itemGenericView: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: (width / 3) - 20,
        paddingHorizontal: 10
    },
    itemText: {
        textAlign: 'center'
    },
    headerTitle: {
        marginHorizontal: 20
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
    userLink: {
        marginTop: 5,
        marginLeft: 5
    }

});
export default Info;