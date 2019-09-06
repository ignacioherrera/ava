/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Image } from 'react-native';
import { profileActiveIcon, addIcon, homeIcon, chatIcon, clockIcon, profileIcon, clockActiveIcon, addActiveIcon, chatActiveIcon } from '../images';

type Props = {};
const { height, width } = Dimensions.get('window');
class BottomBar extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    goChat = () => {
        if (this.props.userActive !== undefined && this.props.userActive.key !== this.props.user._id) {
            this.props.navigation.navigate('Home', { userActive: JSON.stringify(this.props.userActive), });
        }
    }
    goProfile = () => {
        if (this.props.userActive !== undefined) {
            this.props.navigation.navigate('Profile', { userActive: JSON.stringify(this.props.userActive) });
        }
    }
    createGift = () => {
        if (this.props.userActive !== undefined && this.props.userActive.key !== this.props.user._id) {
            this.props.navigation.navigate('NewGift', {
                userActive: JSON.stringify(this.props.userActive)
            });
        }
    };
    componentDidMount() {

    }
    checkPayDates(b) {
        if (b !== undefined) {
            const req = JSON.parse(JSON.stringify(b));
            const str = req.split('T')[0].split('-');
            const date = new Date(parseInt(str[0]), parseInt(str[1]) - 1, parseInt(str[2]));
            const a = new Date();
            return (date - a) / 1000;

        }
    }
    render() {
        if (this.props.navigation === undefined || this.props.user === undefined) {
            return null;
        }
        return (
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={() => { this.props.navigation.navigate('Info') }} style={{ paddingHorizontal: 5, paddingVertical: 15 }} >
                    <Image source={homeIcon} style={{ width: 28.5, height: 30 }} />
                </TouchableOpacity>

                <TouchableOpacity onPress={this.props.alertFn} style={{ paddingHorizontal: 5, paddingVertical: 15 }} >
                    <Image source={(this.props.alert) ? clockActiveIcon : clockIcon} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>

                <TouchableOpacity disabled={this.props.userActive === undefined || this.checkPayDates(this.props.userActive.actual_birth) <= 430000 || this.props.userActive.key === this.props.user.key || this.props.userActive.key === this.props.user._id} onPress={this.createGift} style={{ paddingHorizontal: 5, paddingVertical: 15 }} >
                    <Image source={(this.props.navigation.state.routeName === 'NewGift') ? addActiveIcon : addIcon} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>

                <TouchableOpacity disabled={this.props.userActive === undefined || this.props.userActive.key === this.props.user.key || this.props.userActive.key === this.props.user._id} onPress={this.goChat} style={{ paddingHorizontal: 5, paddingVertical: 15 }} >
                    <Image source={(this.props.navigation.state.routeName === 'Home') ? chatActiveIcon : chatIcon} style={{ width: 32, height: 30, marginTop: 3 }} />
                </TouchableOpacity>

                <TouchableOpacity onPress={this.goProfile} style={{ paddingHorizontal: 5, paddingVertical: 15 }} >
                    <Image source={(this.props.navigation.state.routeName === 'Profile') ? profileActiveIcon : profileIcon} style={{ width: 30, height: 30, marginTop: 5, marginLeft: 5 }} />
                </TouchableOpacity>
            </View>
        )

    }

}
const styles = StyleSheet.create({
    bottomBar: {
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        width: width
    },
});
export default BottomBar;