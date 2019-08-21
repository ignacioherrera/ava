/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking, Dimensions, FlatList, Image, TouchableHighlight, ActivityIndicator } from 'react-native';
import { likeOffIcon, addIcon, likeOnIcon, backIcon, bestIcon, profileIcon } from '../images';
import firebase from '../Firebase';
type Props = {};
const { height, width } = Dimensions.get('window');
class GiftsInfo extends Component<Props> {
    constructor(props) {
        super(props);

        this.refGifts = firebase.firestore().collection('gifts');
        this.refVotes = firebase.firestore().collection('users').doc(this.props.user._id).collection('votes');
        this.giftSubscription = null;
        this.voteSubscription = null;
        this.state = {
            gifts: [],
            votes: [],
            refresh: false,
            isLoading: true,
            loadingGifts: true,
            payState: false,
            daysToCloseVotation: 0,
            daysToBirthday: 0,
            userActive: null,
        };
    }
    checkVotes = (key) => {
        const r = this.state.votes.find(k => k.gift_key === key);
        if (r !== undefined) return true;
        return false;
    }
    renderGift = ({ item, index }) => {
        return (
            <View style={[styles.giftView]} >
                <View style={styles.giftTopBar}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
            
                    }}>
                        <Image source={(item.creator.avatar !== undefined && item.creator.avatar !== '') ? { uri: item.creator.avatar } : profileIcon} style={{ width: 32, height: 32, marginTop: 5, marginLeft: 5 }} />
                        <View style={{marginLeft: 10}}>
                            <Text style={styles.giftName}>{item.name}</Text>
                            <Text style={styles.giftDescription}>{'Price: $' + item.price}</Text>
                        </View>
                    </View>
                    <TouchableHighlight onPress={() => { Linking.openURL(item.link) }} style={{ paddingHorizontal: 5, paddingVertical: 15 }} >
                        <Image source={backIcon} style={{ width: 23, height: 18 }} />
                    </TouchableHighlight>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                    <TouchableHighlight disabled={this.state.loadingGifts} onPress={() => { this.vote(item.key, this.props.userActive) }} style={styles.voteButton}>
                        <Image source={(this.checkVotes(item.key)) ? likeOnIcon : likeOffIcon} style={{ width: 23, height: 19}} />
                    </TouchableHighlight>
                    <Text style={styles.giftVotes}>{(item.vote_counter===1)?item.vote_counter+' like': item.vote_counter+' likes'}</Text>
                    </View>

                    
                </View>
            </View>
        );

    };
    onGiftUpdate = (querySnapshot) => {
        const gifts = [];
        querySnapshot.forEach((gift) => {
            const { description, date, link, price, name, creator, vote_counter } = gift.data();
            gifts.push({
                key: gift.id,
                description,
                date,
                link,
                name,
                price,
                creator,
                vote_counter
            });
        });
        gifts.sort(function (a, b) {
            return b.vote_counter - a.vote_counter;
        });
        console.log('Regalos', gifts);
        this.setState({
            gifts,
            isLoading: false,
            loadingGifts: false
        });
    }
    onVoteUpdate = (querySnapshot) => {
        const votes = [];

        querySnapshot.forEach((vote) => {
            const { gift_key, for_user } = vote.data();
            votes.push({ gift_key, for_user, key: vote.id });
        });
        console.log('votes', votes);
        this.setState({
            votes,
        });
    }

    componentDidMount() {
        console.log('propiedades', this.props);
        if (this.props.userActive !== undefined && this.props.user !== undefined && this.props.daysToBirthday !== undefined) {
            console.log('el user', this.props.user);
            this.refVotes = firebase.firestore().collection('users').doc(this.props.user._id).collection('votes');
            this.voteSubscription = this.refVotes.onSnapshot(this.onVoteUpdate, (error) => {
                alert('Firebase connection error')
            });
            this.giftSubscription = this.refGifts.where('for_user.key', '==', this.props.userActive.key).where('for_user.actual_birth', '==', JSON.parse(JSON.stringify(this.props.userActive.actual_birth))).onSnapshot(this.onGiftUpdate, (error) => {
                alert('Firebase connection error')
            });
        }
    }
    componentDidUpdate(prevProps) {
        console.log('las props', this.props);
        if (prevProps.userActive !== this.props.userActive) {
            if (this.props.userActive !== undefined && this.props.user !== undefined && this.props.daysToBirthday !== undefined) {
                this.setState({
                    isLoading: true,
                    loadingGifts: true
                });
                this.giftSubscription();
                this.giftSubscription = this.refGifts.where('for_user.key', '==', this.props.userActive.key).where('for_user.actual_birth', '==', JSON.parse(JSON.stringify(this.props.userActive.actual_birth))).onSnapshot(this.onGiftUpdate, (error) => {
                    alert('Firebase connection error')
                });
            }
        }
    }
    createGift = () => {
        const { name, actual_birth, key } = this.props.userActive;
        this.props.navigation.navigate('NewGift', {
            user: JSON.stringify({ name, actual_birth, key })
        });
    };
    vote = (giftKey, user) => {
        console.log(this.state.votes);
        console.log(this.refVotes);
        console.log(giftKey, user);
        if (this.checkVotes(giftKey)) {
            const element = this.state.votes.find(k => k.gift_key === giftKey);
            firebase.firestore().runTransaction((transaction) => {
                return transaction.get(this.refVotes.doc(element.key)).then(() => {
                    transaction.delete(this.refVotes.doc(element.key));
                    transaction.update(this.refGifts.doc(giftKey), { vote_counter: firebase.firestore.FieldValue.increment(-1) });
                });

            }).then(() => {
                console.log('todo ok');
            })

        }
        else {
            firebase.firestore().runTransaction((transaction) => {
                const newDocRef = this.refVotes.doc();
                return transaction.get(this.refVotes.doc(newDocRef.id)).then(() => {
                    transaction.set(this.refVotes.doc(newDocRef.id), { gift_key: giftKey, for_user: { key: user.key, actual_birth: user.actual_birth } })
                    transaction.update(this.refGifts.doc(giftKey), { vote_counter: firebase.firestore.FieldValue.increment(1) });
                })
            }).then((r) => {
                console.log(r);
            });
        }

    }
    pay = () => {
        Linking.openURL('https://www.paypal.com/myaccount/').then(() => { });
    }
    render() {
        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#000" animating={true} style={[styles.loading]} />
                </View>
            );
        }
        if (this.props.user !== undefined && this.props.userActive !== undefined && this.props.user._id === this.props.userActive.key) {
            return (
                <View style={{ marginTop: 50 }}>
                    <Text style={{ fontFamily: 'Lato-Regular', fontSize: 18, color: '#666666', textAlign: 'center' }}>Your friends are planning to give you something awesome here!</Text>
                </View>
            )
        }
        if (this.props.daysToBirthday !== undefined && this.props.daysToBirthday <= 5 && this.state.gifts.length > 0) {
            return (
                <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 11, paddingHorizontal: 45 }} >
                    <Image source={bestIcon} style={{ width: 33, height: 21, marginBottom: 8, marginTop: 16 }} />
                    <Text style={styles.giftName}>{this.state.gifts[0].name}</Text>
                    <Text style={styles.giftDescription}>{this.state.gifts[0].description}</Text>
                    <Text style={styles.giftDescription}>{'Price: $' + this.state.gifts[0].price}</Text>
                    <Text style={styles.giftLink} onPress={() => { Linking.openURL(this.state.gifts[0].link) }}>{this.state.gifts[0].link.substring(0, 20) + '...'}</Text>
                    <Text style={[styles.giftDescription, { marginTop: 10 }]}>{'Sugerido por ' + this.state.gifts[0].creator.name}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 18 }}>
                        <View>
                        <Image source={likeOnIcon} style={{ width: 16, height: 16, marginTop: 5, margin: 5 }} />
                        <Text style={styles.giftVotes}>{this.state.gifts[0].vote_counter+' likes'}</Text>
                        </View>
                        
                    </View>
                    <View style={{ marginTop: 15, alignItems: 'center' }}>
                        <TouchableHighlight style={styles.btn} onPress={this.pay}>
                            <Text style={styles.titleBtn}>Send Money</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.container}>
                <FlatList
                    style={styles.giftList}
                    extraData={this.state.refresh}
                    data={this.state.gifts}
                    renderItem={item => this.renderGift(item)}
                />
            </View>
        )
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    giftTopBar:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    giftName: {
        fontFamily: 'Lato-Bold',
        fontSize: 18,
        marginBottom: 3,
        color: '#000'
    },
    giftDescription: {
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        color: '#000',
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
        marginHorizontal: 'auto'
    },
    giftView: {
        borderWidth: 0,
        borderColor: "#000",
        borderRadius: 10,
        borderTopWidth: 1,
        borderTopColor: '#D0D0D0',
        marginVertical: 12,
        paddingVertical: 10,
        paddingHorizontal: 25
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
export default GiftsInfo;