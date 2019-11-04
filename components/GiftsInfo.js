/**
 * @format
 * @flow
 */
import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { likeOffIcon, likeOnIcon, linkIcon, editIcon } from "../images";
import Like from "../components/like";
import firebase from "../Firebase";
type Props = {};
const { height, width } = Dimensions.get("window");
class GiftsInfo extends Component<Props> {
  constructor(props) {
    super(props);
    this.props.navigation;
    this.refGifts = firebase.firestore().collection("gifts");
    this.refVotes = firebase
      .firestore()
      .collection("users")
      .doc(this.props.user._id)
      .collection("votes");
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
      userActive: null
    };
  }
  checkVotes = key => {
    const r = this.state.votes.find(k => k.gift_key === key);
    if (r !== undefined) return true;
    return false;
  };
  edit = gift => {
    this.props.navigation.navigate("EditGift", { gift: JSON.stringify(gift) });
  };

  renderGift = ({ item, index }) => {
    return (
      <View style={styles.giftView}>
        <View style={styles.giftTopBar}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            {item.creator.avatar !== undefined && item.creator.avatar !== "" ? (
              <Image
                source={{ uri: item.creator.avatar }}
                style={{ width: 32, height: 32, marginTop: 5, marginLeft: 5 }}
              />
            ) : (
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderWidth: 1,
                  borderColor: "#000",
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Text
                  style={{
                    fontFamily: "Lato-Bold",
                    fontSize: 20
                  }}
                >
                  {item.creator.name[0]}
                </Text>
              </View>
            )}
            {item.creator.key === this.props.user._id ? (
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  this.edit(item);
                }}
              >
                <Text style={styles.giftName}>{item.name}</Text>
                <Text style={styles.giftDescription}>
                  {"Price: $" + item.price}
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{ marginLeft: 10 }}
                onPress={() => {
                  this.edit(item);
                }}
              >
                <Text style={styles.giftName}>{item.name}</Text>
                <Text style={styles.giftDescription}>
                  {"Price: $" + item.price}
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(item.link);
              }}
              style={{ paddingHorizontal: 5, paddingVertical: 15 }}
            >
              <Image source={linkIcon} style={{ width: 24, height: 22 }} />
            </TouchableOpacity>
          </View>
        </View>
        {item.photo !== undefined && (
          <View
            style={{
              alignItems: "center",
              height: 350
            }}
          >
            <Image style={styles.photo} source={{ uri: item.photo }} />
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 25,
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 15
          }}
        >
          <Like
            active={this.checkVotes(item.key)}
            disabled={this.state.loadingGifts || this.props.daysToBirthday <= 5}
            onPress={() => {
              return new Promise((resolve, reject) => {
                resolve(this.vote(item.key, this.props.userActive));
              });
            }}
            votes={item.vote_counter}
          />
          <TouchableOpacity
            onPress={this.pay}
            disabled={index !== 0 || this.props.daysToBirthday > 5}
            style={
              index !== 0 || this.props.daysToBirthday > 5
                ? styles.payBtnDisabled
                : styles.payBtn
            }
          >
            <Text
              style={
                index !== 0 || this.props.daysToBirthday > 5
                  ? styles.payTextDisabled
                  : styles.payText
              }
            >
              Pay Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  onGiftUpdate = querySnapshot => {
    const gifts = [];
    querySnapshot.forEach(gift => {
      const {
        description,
        date,
        link,
        price,
        name,
        creator,
        photo,
        vote_counter,
        for_user
      } = gift.data();
      let us = creator;
      if (this.props.users !== undefined) {
        let u = this.props.users.find(us => us.key === creator.key);
        if (u !== undefined) {
          us.avatar = u.avatar;
        }
      }
      gifts.push({
        key: gift.id,
        description,
        date,
        link,
        name,
        for_user,
        photo,
        price,
        creator: us,
        vote_counter
      });
    });
    gifts.sort(function(a, b) {
      return b.vote_counter - a.vote_counter;
    });
    this.setState({
      gifts,
      isLoading: false,
      loadingGifts: false
    });
  };
  onVoteUpdate = querySnapshot => {
    const votes = [];

    querySnapshot.forEach(vote => {
      const { gift_key, for_user } = vote.data();
      votes.push({ gift_key, for_user, key: vote.id });
    });
    this.setState({
      votes
    });
  };

  componentDidMount() {
    if (
      this.props.userActive !== undefined &&
      this.props.user !== undefined &&
      this.props.daysToBirthday !== undefined
    ) {
      this.refVotes = firebase
        .firestore()
        .collection("users")
        .doc(this.props.user._id)
        .collection("votes");
      this.voteSubscription = this.refVotes.onSnapshot(
        this.onVoteUpdate,
        error => {
          alert("Firebase connection error");
        }
      );
      this.giftSubscription = this.refGifts
        .where("for_user.key", "==", this.props.userActive.key)
        .where(
          "for_user.actual_birth",
          "==",
          JSON.parse(JSON.stringify(this.props.userActive.actual_birth))
        )
        .onSnapshot(this.onGiftUpdate, error => {
          alert("Firebase connection error");
        });
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.users !== this.props.users) {
      this.setState({ refresh: !this.state.refresh });
    }

    if (prevProps.userActive !== this.props.userActive) {
      if (
        this.props.userActive !== undefined &&
        this.props.user !== undefined &&
        this.props.daysToBirthday !== undefined
      ) {
        this.setState({
          isLoading: true,
          loadingGifts: true
        });
        this.giftSubscription();
        this.giftSubscription = this.refGifts
          .where("for_user.key", "==", this.props.userActive.key)
          .where(
            "for_user.actual_birth",
            "==",
            JSON.parse(JSON.stringify(this.props.userActive.actual_birth))
          )
          .onSnapshot(this.onGiftUpdate, error => {
            alert("Firebase connection error");
          });
      }
    }
  }
  createGift = () => {
    const { name, actual_birth, key } = this.props.userActive;
    this.props.navigation.navigate("NewGift", {
      user: JSON.stringify({ name, actual_birth, key })
    });
  };
  vote = (giftKey, user) => {
    if (this.checkVotes(giftKey)) {
      const element = this.state.votes.find(k => k.gift_key === giftKey);
      return firebase
        .firestore()
        .runTransaction(transaction => {
          return transaction.get(this.refVotes.doc(element.key)).then(() => {
            transaction.delete(this.refVotes.doc(element.key));
            transaction.update(this.refGifts.doc(giftKey), {
              vote_counter: firebase.firestore.FieldValue.increment(-1)
            });
          });
        })
        .then(() => {});
    } else {
      return firebase
        .firestore()
        .runTransaction(transaction => {
          const newDocRef = this.refVotes.doc();
          return transaction.get(this.refVotes.doc(newDocRef.id)).then(() => {
            transaction.set(this.refVotes.doc(newDocRef.id), {
              gift_key: giftKey,
              for_user: { key: user.key, actual_birth: user.actual_birth }
            });
            transaction.update(this.refGifts.doc(giftKey), {
              vote_counter: firebase.firestore.FieldValue.increment(1)
            });
          });
        })
        .then(r => {});
    }
  };
  pay = () => {
    Linking.openURL("https://www.paypal.com/myaccount/").then(() => {});
  };
  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator
            size="large"
            color="#000"
            animating={true}
            style={[styles.loading]}
          />
        </View>
      );
    }
    if (
      this.props.user !== undefined &&
      this.props.userActive !== undefined &&
      this.props.user._id === this.props.userActive.key
    ) {
      return (
        <View style={{ marginTop: 120 }}>
          <Text
            style={{
              fontFamily: "Lato-Regular",
              fontWeight: "bold",
              fontSize: 18,
              color: "#666666",
              textAlign: "center"
            }}
          >
            Your friends are planning to give you something awesome here!
          </Text>
        </View>
      );
    }
    if (
      this.props.daysToBirthday !== undefined &&
      this.props.daysToBirthday > 30
    ) {
      return (
        <View style={{ marginTop: 120 }}>
          <Text
            style={{
              fontFamily: "Lato-Regular",
              fontWeight: "bold",
              fontSize: 18,
              color: "#666666",
              textAlign: "center"
            }}
          >
            Soon we will prepare an
          </Text>
          <Text
            style={{
              fontFamily: "Lato-Regular",
              fontWeight: "bold",
              fontSize: 18,
              color: "#666666",
              textAlign: "center"
            }}
          >
            incredible gift here
          </Text>
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
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  lastItem: {
    borderBottomWidth: 1,
    marginBottom: 80,
    paddingBottom: 20,
    borderBottomColor: "#D0D0D0"
  },
  payBtnDisabled: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 5,
    padding: 5
  },
  payTextDisabled: {
    fontSize: 12,
    fontFamily: "Lato-Bold",
    fontWeight: "900",
    color: "#E5E5E5"
  },
  payBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 5
  },
  photo: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: "contain"
  },
  payText: {
    fontSize: 12,
    fontFamily: "Lato-Bold",
    fontWeight: "900",
    color: "#000"
  },
  giftTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 10
  },
  giftName: {
    fontFamily: "Lato-Bold",
    fontSize: 18,
    marginBottom: 3,
    color: "#000",
    fontWeight: "bold"
  },
  giftDescription: {
    fontSize: 12,
    fontFamily: "Lato-Bold",
    color: "#000",
    fontWeight: "bold"
  },
  voteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  giftVotes: {
    fontSize: 12,
    fontFamily: "Lato-Bold",
    color: "#000",
    fontWeight: "bold"
  },
  giftList: {
    marginBottom: 80
  },
  giftLink: {
    fontSize: 19,
    fontFamily: "Lato-Regular",
    color: "#2680EB",
    textDecorationLine: "underline",
    textAlign: "center"
  },
  titleBtn: {
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Lato-Bold",
    margin: 10,
    color: "#fff"
  },
  btn: {
    width: 290,
    backgroundColor: "#26EB96",
    borderRadius: 10,
    paddingVertical: 20,
    marginTop: 60,
    marginHorizontal: "auto"
  },
  giftView: {
    borderWidth: 0,
    paddingBottom: 10,
    paddingTop: 0
  },
  itemGenericView: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: width / 3 - 20,
    paddingHorizontal: 10
  },
  itemText: {
    textAlign: "center"
  },
  headerTitle: {
    marginHorizontal: 20
  },
  blockText: {
    paddingHorizontal: 10,
    textAlign: "center"
  },
  title: {
    fontFamily: "Lato-Bold",
    fontSize: 18,
    marginLeft: 5
  },
  userLink: {
    marginTop: 5,
    marginLeft: 5
  }
});
export default GiftsInfo;
