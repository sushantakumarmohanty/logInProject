import React, { Component } from 'react'
import DeviceInfo from 'react-native-device-info'
import { Container, Content, Icon } from 'native-base';
import { View, Text, Image, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView, FlatList, ToastAndroid, TextInput, AlertIOS } from 'react-native';
import Loader from 'components/common/Loader';
import Logo from '../../assets/icons/home/UticLogo.png'
import { RegEx } from "configs/AppConfig";
import Modal from "react-native-modal";
import styles from 'components/style';
import { wrapperAPI } from "components/Utility";
import { saveProfile } from 'storage/actions';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation'

class LoginPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            errorTextinput: false,
            disableCTA: true,
            mobileoremail: "",
            isFocusOnTextbox: false,
            isFocusOnPass: false,
            toggleShowPass: true,
            showPass: false,
            password: '',
            errorPassword: false,
            wrongPasswordModal: false,
            loginModalVisible: false,
            errorMessage: '',
            loggedIn: props.loggedIn
        }
    }

    componentDidMount() {
        this.checkLogin();
    }

    checkLogin = () => {
        const logoutAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'HomePage' })],
        });
        if (this.state.loggedIn) {
            this.props.navigation.dispatch(logoutAction);
        }
    }

    targetEmailText = enteredValue => {
        if (enteredValue && RegEx.email.test(enteredValue)) {
            //valid Email hence Call the API.
            this.setState({
                mobileoremail: enteredValue,
                disableCTA: true
            });
        } else {
            this.setState({
                mobileoremail: enteredValue,
                disableCTA: true
            });
        }
    };


    loginModalVisiblity = () => {
        this.setState({
            loginModalVisible: true
        });
        setTimeout(() => {
            this.setState({
                loginModalVisible: false
            });
            this.navigatetoOTP();
        }, 2500);
    }

    navigatetoOTP = () => {
        this.props.navigation.navigate("OtpPage", { isForgotPass: false, username: this.state.mobileoremail })
    }

    onFocusTxt = () => {
        this.setState({ isFocusOnTextbox: true, errorTextinput: false });
    };

    offFocusTxt = enteredEmail => {
        if (enteredEmail && RegEx.email.test(enteredEmail)) {
            this.setState({ errorTextinput: false, disableCTA: this.state.password != '' ? false : true, isFocusOnTextbox: false });
        } else if (!enteredEmail || enteredEmail.length == 0) {
            this.setState({ errorTextinput: false, disableCTA: true, isFocusOnTextbox: false });
        } else {
            this.setState({ errorTextinput: true, disableCTA: true, isFocusOnTextbox: false });
        }
    };

    notifyMessage = (error) => {
        this.setState({
            wrongPasswordModal: true,
            errorMessage: error
        });
        setTimeout(() => {
            this.setState({
                wrongPasswordModal: false
            });
        }, 1500);
    }

    validatePassword = (pass) => {
        if (pass.length > 0 && RegEx.password.test(pass)) {
            this.setState({
                password: pass,
                showPass: true,
                disableCTA: false
            })
        }
        else {
            this.setState({
                password: pass.substring(0, pass.length - 1),
                password: pass,
                showPass: true,
                disableCTA: true
            })
        }
    }

    //Todo Need to Impl
    callLoginApi = () => {
        if (!this.state.disableCTA) {
            wrapperAPI("login", {
                "username": this.state.mobileoremail,
                "password": this.state.password,
                "deviceId": DeviceInfo.getUniqueId()
            })
                .then(res => {
                    if (res.data.data) {
                        if (res.data.data.role === "Admin") {
                            this.notifyMessage("Invalid username or password");
                        } else {
                            this.props.saveProfile(res.data.data);
                            this.loginModalVisiblity();
                        }
                    }else {
                        this.notifyMessage(res.data.errorResponse.errorMessage);
                    }
                    console.log("LoggedIn_Res--::", res);
                })
                .catch(err => {
                    console.log("error", err)
                })
        }
    }
    
    onFocusPass = () => {
        this.setState({ errorPassword: false, isFocusOnPass: true });
    }

    offFocusPass = (pass) => {
        if (pass && RegEx.password.test(pass)) {
            this.setState({ isFocusOnPass: false, errorPassword: false, disableCTA: false });
        } else if (!pass || pass.length == 0) {
            this.setState({ isFocusOnPass: false, errorPassword: false, disableCTA: true });
        } else {
            this.setState({ isFocusOnPass: false, errorPassword: true, disableCTA: true });
        }
    }

    togglePass = () => {
        this.setState({
            toggleShowPass: !this.state.toggleShowPass,
            errorPassword: false

        })
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
                        <View style={styles.login_userNameDiv}>
                            <View style={styles.login_lowerDiv}>
                                <View width={"100%"}>
                                    <Text style={styles.userName_div}>
                                        Username
                             </Text>
                                    <TouchableOpacity style={styles.userNameDiv_section}>
                                        <KeyboardAvoidingView
                                            width={"100%"}
                                            behavior="padding"
                                            enabled
                                            style={styles.userName_login}
                                        >
                                            <TextInput
                                                selectionColor={"#4d5054"}
                                                defaultValue={this.state.mobileoremail}
                                                onFocus={() => this.onFocusTxt()}
                                                onBlur={() => this.offFocusTxt(this.state.mobileoremail)}
                                                maxLength={256}
                                                placeholder="Username"
                                                autoCapitalize="none"
                                                placeholderTextColor="grey"
                                                editable={true}
                                                onChangeText={mobileoremail =>
                                                    this.targetEmailText(mobileoremail.toLowerCase())
                                                }
                                                style={[styles.userName_inbox,
                                                {
                                                    borderColor: this.state.isFocusOnTextbox
                                                        ? "#80dc00"
                                                        : "#4d5054"
                                                }
                                                ]}
                                            />
                                        </KeyboardAvoidingView>
                                    </TouchableOpacity>

                                    {this.state.errorTextinput === true ? (
                                        <View>
                                            <Text style={styles.invalid_email}>
                                                Invalid Email Address
                               </Text>
                                        </View>
                                    ) : (
                                            <View />
                                        )}
                                </View>
                                <View style={{}}>
                                    <View style={styles.invalid_padding}>
                                        <View>
                                            <Text style={styles.password_text}>Password</Text>
                                            <View style={styles.password_input}>
                                                <TextInput maxLength={20}
                                                    style={[styles.password_inText, { borderColor: this.state.isFocusOnPass ? '#80dc00' : '#4d5054' }]}
                                                    secureTextEntry={this.state.toggleShowPass} placeholder="Password"
                                                    placeholderTextColor="grey"
                                                    autoCapitalize="none"
                                                    selectionColor={"#4d5054"}
                                                    maxLength={32}
                                                    onChangeText={(text) => this.validatePassword(text)}
                                                    onFocus={() => this.onFocusPass()}
                                                    onBlur={() => this.offFocusPass(this.state.password)}
                                                />
                                                {this.state.showPass ?
                                                    <View style={styles.show_pwd}>
                                                        {this.state.toggleShowPass ?
                                                            <Icon onPress={() => { this.togglePass() }} name={'eye'} style={styles.position_abs} />
                                                            :
                                                            <Icon onPress={() => { this.togglePass() }} name={'eye-off'} style={styles.position_abs} />
                                                        }
                                                    </View>
                                                    : <View></View>
                                                }
                                            </View>
                                        </View>

                                    </View>

                                    {this.state.errorPassword ?
                                        <View style={styles.error_pwd}>
                                            <Text style={styles.error_password}>
                                                Minimum 8 characters & 1 special character required
                                           </Text>
                                        </View> : <View></View>
                                    }
                                    <View style={styles.forgot_pwd}>
                                        <Text style={styles.forgot_pw_text} onPress={() => this.props.navigation.navigate('ForgotPassword')}>Forgot Password ?</Text>
                                    </View>
                                </View>
                            </View>
                            <View>
                                <Text style={styles.term_condition}>
                                    By logging in you are agreeing to our <Text style={styles.privacy_policy}>Privacy Policy</Text> and <Text style={styles.privacy_policy_text}>Terms and Conditions</Text>
                                </Text>
                                <View style={styles.privacy_text_term}>
                                    <TouchableOpacity
                                        disabled={this.state.disableCTA}
                                        onPress={() => this.callLoginApi()}
                                        style={[styles.button_disable,
                                        {
                                            backgroundColor: this.state.disableCTA
                                                ? "#babcbf"
                                                : "#80dc00"
                                        }]
                                        }
                                    >
                                        <Text style={[styles.continue_text, { color: this.state.disableCTA ? 'white' : 'black' }]}>Continue</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Content>
                <Modal isVisible={this.state.wrongPasswordModal}>
                    <View style={styles.incorrect_pairText}>
                        <View width={'90%'} style={styles.incorrect_Text} >
                            <Text style={styles.pwd_pair}>{this.state.errorMessage}</Text>
                        </View>
                    </View>
                </Modal>
                <Modal isVisible={this.state.loginModalVisible}>
                    <View style={styles.modal_view}>
                        <View style={styles.mr_bottom}>
                            <Image source={Logo} style={styles.mr_text} />
                        </View>
                        <View width={'90%'} style={styles.incorrect_Text} >
                            <Text style={styles.login_privacyTerm}>We've sent a One Time Password(OTP) to your email account</Text>
                            <Text style={styles.mobile_email}>{this.state.mobileoremail}</Text>
                            <Text style={styles.pwd_send_text}>Please open your email and use the One Time Password in your email message to login.</Text>
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
        saveProfile: profile => dispatch(saveProfile(profile))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage)