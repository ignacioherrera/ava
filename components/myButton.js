/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';

type Props = {

};
const { height, width } = Dimensions.get('window');
class MyButton extends Component<Props> {
    constructor(props) {
        super(props);
        const { title = 'Enter', style = {}, textStyle = {}, onPress} = props;
        this.title = title;
        this.style = style;
        this.textStyle= textStyle;
        this.onPress = onPress;
        this.state = {
        }
    }
    componentDidMount() {
    }
    render() {
        return (
            <TouchableOpacity onPress={this.props.onPress} style={[styles.btn, this.style]} disabled={this.props.disabled}>
                <Text style={[styles.text, this.textStyles]}>{this.props.title}</Text>
            </TouchableOpacity>
        )

    }

}
const styles = StyleSheet.create({
    btn: {
        width: 290,
        backgroundColor: "#000",
        paddingVertical: 18,
        borderRadius: 30
    }, 
    text:{ 
        textAlign: 'center', 
        fontFamily: 'Lato-Bold',
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold'
    }
});
export default MyButton;