import React, {Component} from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform, AsyncStorage, PermissionsAndroid } from 'react-native';
import { RNCamera } from 'react-native-camera';

export default class Camera extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isRecording: false,
      videoUri: null
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center',}}>
          <TouchableOpacity
              onPress={this.startStopRecording.bind(this)}
              style = {styles.capture}
          >
            <Text style={{fontSize: 14}}>
            { this.state.isRecording ? 'STOP' : 'RECORD' }
            </Text>
          </TouchableOpacity>
        </View>
        <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style = {styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
            onRecordingStarted={this.onRecordingStarted}
        />
      </View>
    );
  }

  async onRecordingStarted(uri) {
    uri.uri = 'file://' + uri.uri;
    var uriObject= JSON.stringify(uri);
    console.warn('Recording started: ', uri);
    await AsyncStorage.setItem('videoUri', uriObject);
  }

  async startStopRecording() {
    if (this.camera) {
      
      if(this.state.isRecording) {
        this.camera.stopRecording();
        this.setState({isRecording: !this.state.isRecording});
      } else {
        if(Platform.OS === 'Android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'My App Storage Permission',
              message: 'My App needs access to your storage so you can save your videos',
            },
          );
          if (granted === true || granted === PermissionsAndroid.RESULTS.GRANTED) {
            this.setState({isRecording: !this.state.isRecording});
            var response = await this.camera.recordAsync();
            console.warn(response);
          } else {
            console.warn("permission request denied")
          }
        } else {
          this.setState({isRecording: !this.state.isRecording});
          var response = await this.camera.recordAsync();
        }
      }
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20
  },
});