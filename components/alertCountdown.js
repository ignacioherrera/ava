/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import CountDown from 'react-native-countdown-component';

type Props = {};
const { height, width } = Dimensions.get('window');
class AlertCountdown extends Component<Props> {
    constructor(props) {
        super(props);
        const { containerStyle = {} } = props;
        this.containerStyle = containerStyle;
        this.state = {
            timeToBirthday: 0,
            time: 0
        }
    }
    componentDidMount() {
        this.setState({time: this.checkPayDates(this.props.date)});
    }
    componentDidUpdate(prevProps) { 
        if (prevProps.date !== this.props.date) {
            const timeUpdate =  this.checkPayDates(this.props.date);
            this.setState({time: timeUpdate, timeToBirthday: timeUpdate});
        }
    }
    checkPayDates(b) {
        if (b !== undefined) {
            const date = new Date(b);
            const a = new Date();
            const time = (date - a) / 1000;
            return time;

        }
    }
    updateTime =(time)=>{
       this.setState({timeToBirthday: time}); 
    }
    render() {
        if (this.props.onPress === undefined || this.props.date === undefined || this.state.time ===undefined) {
            return null;
        }
        return (
            <TouchableOpacity onPress={this.props.onPress} style={(this.props.visible)?styles.alert:{display:'none'}}>
                <View style={[styles.alertContainer, this.containerStyle]}>
                    <Text style={styles.alertTitle}>Birthday Time</Text>
                    <CountDown
                        onChange={this.updateTime}
                        until={this.state.time}
                        onFinish={() => this.props.onFinish}
                        size={18}
                        style={{ marginTop: 10 }}
                        timeLabelStyle={{
                            fontSize: 11,
                            fontFamily: 'Lato-Bold',
                            fontWeight: 'bold',
                            color: '#000'
                        }}
                        digitStyle={(this.state.timeToBirthday <= 432000) ? styles.countClose : styles.countOpen}
                        digitTxtStyle={{
                            color: '#fff',
                            fontSize: 21,
                            fontWeight: 'bold',
                            fontFamily: 'Lato-Bold'
                        }}
                        separatorStyle={{ color: '#fff' }}
                        showSeparator={true}
                    />
                    <Text style={styles.alertDescription}>Every time look at it so you don't forget to congratulate it.</Text>
                </View>
            </TouchableOpacity>
        )

    }

}
const styles = StyleSheet.create({
    alertContainer: {
        paddingVertical: 31,
        paddingHorizontal: 26,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20
    },
    alertTitle: {
        fontFamily: 'Lato-Bold',
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 20
    },
    alertDescription: {
        fontFamily: 'Lato-Bold',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        fontWeight: 'bold'
    },
    countOpen: {
        backgroundColor: '#000',
        borderRadius: 10,
        marginHorizontal: 0,
        color: '#fff'
    },
    countClose: {
        backgroundColor: '#EB2626',
        borderRadius: 10,
        color: '#fff',
        marginHorizontal: 0
    },
    alert: {
        width: width,
        height: height,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)'
    }

});
export default AlertCountdown;