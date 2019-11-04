/**
 * @format
 * @flow
 */
import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator
} from "react-native";
import { likeOffIcon, likeOnIcon } from "../images";
type Props = {};
class Like extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }
  Press = () => {
    this.setState({ loading: true });
    console.log(this.props.onPress);
    this.props.onPress()
      .then(r => {
        this.setState({ loading: false });
        return r;
      })
      .catch(err => {
        this.setState({ loading: false });
        return err;
      });
  };
  render() {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <TouchableOpacity
          disabled={this.props.disabled || this.state.loading }
          onPress={this.Press}
          style={styles.voteButton}
        >
          <Image
            source={this.props.active ? likeOnIcon : likeOffIcon}
            style={{ width: 23, height: 20 }}
          />
        </TouchableOpacity>
        {this.state.loading ? (
          <ActivityIndicator
            size="small"
            color="#000"
            animating={true}
          />
        ) : (
          <Text style={styles.giftVotes}>
            {this.props.votes === 1
              ? this.props.votes + " like"
              : this.props.votes + " likes"}
          </Text>
        )}
      </View>
    );
  }
}
Like.defaultProps = {
  active: false,
  disabled: false,
  active: false,
  votes: 0,
  onPress: ()=>{}
};
const styles = StyleSheet.create({
  voteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  giftVotes: {
    fontSize: 12,
    fontFamily: "Lato-Bold",
    color: "#000",
    fontWeight: "bold"
  }
});
export default Like;
