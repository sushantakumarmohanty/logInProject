import React, { Component } from 'react'
import { Container, Content, Form } from 'native-base';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, AlertIOS, ToastAndroid } from 'react-native';
import Loader from 'components/common/Loader';
import OTPTextView from "react-native-otp-textinput";
import { withNavigation } from 'react-navigation';
import Logo from '../../assets/icons/home/UticLogo.png'
import { RegEx } from "configs/AppConfig";
import CountDown from "react-native-countdown-component";
import Homepage from 'components/BottomNav/HomePage'
import { StackActions, NavigationActions } from 'react-navigation'
import Modal from "react-native-modal";
import { connect } from 'react-redux';
import { logInUser } from 'storage/actions';
import styles from 'components/style';
import DeviceInfo from 'react-native-device-info'
import { wrapperAPI } from "components/Utility";

class OtpPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            emptyOTP: false,
            disableCTA: true,
            otpValueInput: "",
            otpLimitExceeded: false,
            session: true,
            loginModalVisible: false,
            isFocusOnTextbox: false,
            profile: props.profile,
            isForgotPass: props.navigation.state.params.isForgotPass,
            username: props.navigation.state.params.username,
            wrongOtpModal: false,
            token: props.profile.token,
            loggedIn: props.loggedIn,
            errorMessage: ''

        }
    }

    componentDidMount() {
        this.sendOtpApi()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.profile) {
            this.setState({ profile: nextProps.profile, loggedIn: nextProps.loggedIn })
        }
    }

    allowCorrectFormat = (fieldName, enteredValue) => {
        if (fieldName === "verifyotpUser") {
            enteredValue = enteredValue.trim();
            if (enteredValue && RegEx.numberFormat.test(enteredValue)) {
                this.setState(
                    {
                        otpValueInput: enteredValue
                    },
                    () => this.offFocusOtpVerification(this.state.otpValueInput)
                );
            } else {
                this.setState({
                    otpValueInput: enteredValue.substring(0, enteredValue.length - 1)
                });
            }
        }
    };

    offFocusOtpVerification(otpValueInput) {
        if (otpValueInput && otpValueInput.length == 6) {
            this.setState({
                disableCTA: false
            });
        } else {
            this.setState({
                disableCTA: true
            });
        }
    }

    continueBtnHandler = () => {
        this.verifyOTP();
    };

    verifyOTP = () => {
        var otpLength = this.state.otpValueInput.length;
        if (otpLength === 6) {
            this.setState({ disableCTA: false });
        }
    }
    //Todo Need to Impl
    sendOtpApi = () => {
        let request = {
            "username": this.state.username,
            "deviceId": DeviceInfo.getUniqueId()
        }
        console.log("request_object", request)
        wrapperAPI("sendOtp", request)
            .then(resp => {
                console.log("RESP_SEND_OTP", resp.data)
            })
            .catch(error => {
                console.log('Error ', error);
            })
    }

    //Todo Need to Impl
    otpVerificationApi = () => {
        wrapperAPI("verifyOtp", {
            "deviceId": DeviceInfo.getUniqueId(),
            "otp": this.state.otpValueInput
        })
            .then(res => {
                if (res.data.data) {
                    this.loginModalVisiblity();
                } else {
                    this.notifyMessage(res.data.errorResponse.errorMessage);
                }
                console.log("Verify OTP Res", res.data);
            })
            .catch(err => {
                console.log("error", err)
            })
    }

    onSubmit = () => {
        if (!this.state.disableCTA) {
            this.otpVerificationApi();
        }
    };
    notifyMessage = (error) => {
        this.setState({
            wrongOtpModal: true,
            errorMessage: error
        });
        setTimeout(() => {
            this.setState({
                wrongOtpModal: false
            });
        }, 1500);
    }

    loginModalVisiblity = () => {
        if (this.state.isForgotPass) {
            this.navigateToChangePassword();
        } else {
            this.props.logInUser({ loggedIn: true });
            this.setState({
                loginModalVisible: true
            });
            setTimeout(() => {
                this.setState({
                    loginModalVisible: false
                });
                this.navigatetoHomepage();
            }, 1500);
        }
    }

    navigateToChangePassword = () => {
        this.props.navigation.navigate('ChangePassword', { username: this.state.username })
    }

    navigatetoHomepage = () => {
        const logoutAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'HomePage' })],
        });
        this.props.navigation.dispatch(logoutAction);
    }

    onFocusTxt = () => {
        this.setState({ isFocusOnTextbox: true });
    };

    offFocusTxt = () => {
        this.setState({ isFocusOnTextbox: true });
    };

    resetCounter = () => {
        this.setState({ session: true })
    }

    render() {
        return (
            <Container>
                <Loader loading={this.state.loading} />
                <Content ref={c => this._content = c} style={styles.login_backGround}>
                    <View style={styles.login_wrapper}>
                        <View style={styles.login_imageView}>
                            <Image source={Logo} style={styles.login_image_path} />
                        </View>
                        <View width={"100%"} style={styles.verify_otp}>
                            <View style={styles.verify_otp_page}>
                                <Text style={styles.verify_otp_page_text}>Enter OTP (One Time Password)</Text>
                                <OTPTextView
                                    containerStyle={{ width: "100%", borderRadius: 5, zIndex: 99, backgroundColor: '#2e3033', alignItems: 'center', height: 45, borderWidth: 1, marginTop: 8, borderColor: this.state.isFocusOnTextbox ? '#80dc00' : '#4d5054' }}
                                    textInputStyle={styles.otp_verify_ap}
                                    tintColor="#2e3033"
                                    onFocus={() => this.setState({ emptyOTP: false })}
                                    keyboardType="numeric"
                                    cellTextLength={6}
                                    inputCount={1}
                                    letterSpacing={18}
                                    placeholder=""
                                    keyboardType="numeric"
                                    returnKeyType={"next"}
                                    onChangeText={text =>
                                        this.allowCorrectFormat("verifyotpUser", text)
                                    }
                                    defaultValue={this.state.mobileoremail}
                                    onFocus={() => this.onFocusTxt()}
                                    onBlur={() => this.offFocusTxt()}
                                    maxLength={6}
                                    onSubmitEditing={() => this.continueBtnHandler()}
                                    value={this.state.otpValueInput}
                                />
                                {this.state.session ? (
                                    <View style={styles.verify_otp_row}>
                                        <CountDown
                                            style={styles.count_down_start}
                                            until={2 * 60}
                                            size={12}
                                            onFinish={() => this.setState({ session: false })}
                                            digitStyle={{ backgroundColor: "#202224" }}
                                            digitTxtStyle={{ color: "#fff" }}
                                            timeToShow={["M", "S"]}
                                            timeLabels={{ m: null, s: null }}
                                            showSeparator={true}
                                            separatorStyle={{ color: '#fff' }}

                                        />
                                    </View>
                                ) : (
                                        <View></View>
                                    )}
                                <View>
                                    {this.state.otpLimitExceeded == true ? (
                                        <View style={styles.count_dn_end}>
                                            <Text style={styles.start_count}>
                                                You have attempted OTP enter 3 times. Try after 60 mins
                                </Text>
                                        </View>
                                    ) : (
                                            !this.state.session && (
                                                <View style={styles.otp_received}>
                                                    <Text style={styles.otp_not_received}>
                                                        OTP not received?
                                         </Text>
                                                    <TouchableOpacity onPress={() => this.resetCounter()}>
                                                        <Text style={styles.resend_otp_text}>
                                                            RESEND OTP
                                          </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        )}
                                </View>
                            </View>
                            <View style={{}}>
                                <View style={styles.al_item_center}>
                                    <TouchableOpacity
                                        disabled={this.state.disableCTA}
                                        onPress={() => this.onSubmit()}
                                        style={[styles.al_item_content_text,
                                        {
                                            backgroundColor: this.state.disableCTA
                                                ? "#babcbf"
                                                : "#73c513",
                                        }]
                                        }
                                    >
                                        <Text style={styles.verify_continue_text}>{this.state.isForgotPass ? 'Verify' : 'Continue'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.go_back_text}>
                                    <TouchableOpacity
                                        onPress={() => this.props.navigation.goBack()}
                                        style={
                                            styles.back_go_text
                                        }
                                    >
                                        <Text style={styles.verify_continue_text}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Content>
                <Modal isVisible={this.state.loginModalVisible}>
                    <View style={styles.back_track_text}>
                        <View style={styles.mr_bottom}>
                            <Image source={Logo} style={styles.mr_text} />
                        </View>
                        <View width={'90%'} style={styles.verify_text_otpGenerate}>
                            <Text style={styles.welcome_back_text}>
                                Welcome back
                                </Text>
                        </View>
                        <View width={'90%'} style={styles.welcome_text_welcome} >
                            <Text style={styles.acc_open}>You have successfully Loggedin to your UTIC account</Text>
                        </View>
                    </View>
                </Modal>
                <Modal isVisible={this.state.wrongOtpModal}>
                    <View style={styles.acc_pt_text}>
                        <View width={'90%'} style={styles.acc_text_center} >
                            <Text style={styles.otp_incorrect_verify}>{this.state.errorMessage}</Text>
                        </View>
                    </View>
                </Modal>
            </Container>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        profile: state.authReducer.profile,
        loggedIn: state.authReducer.loggedIn
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        logInUser: (loggedIn) => dispatch(logInUser(loggedIn)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(OtpPage)