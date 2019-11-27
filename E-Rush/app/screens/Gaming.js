import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { Image } from "react-native-elements";
import ActionButton from "react-native-action-button";
import Icon from "react-native-vector-icons/Ionicons";

import { firebaseApp } from "../utils/FireBase";
import firebase from "firebase/app";
import "firebase/firestore";
import AddGaming from "./Gamings/addGaming";
const db = firebase.firestore(firebaseApp);

export default class Gaming extends Component {
  constructor() {
    super();

    this.state = {
      login: false,
      gaming: null,
      startGaming: null,
      limitGaming: 8,
      isLoading: true
    };
  }

  componentDidMount() {
    this.checkLogin();
    this.loadGaming();
  }

  checkLogin = () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({
          login: true
        });
      } else {
        this.setState({
          login: false
        });
      }
    });
  };

  loadActionButton = () => {
    const { login } = this.state;

    if (login) {
      return (
        <ActionButton
          buttonColor="#00a680"
          onPress={() =>
            this.props.navigation.navigate("AddGaming", {
              loadGamings: this.loadGaming
            })
          }
        />
      );
    }

    return null;
  };

  loadGaming = async () => {
    const { limitGaming } = this.state;
    let resultGaming = [];

    const gamings = db
      .collection("gaming")
      .orderBy("createdAt", "desc")
      .limit(limitGaming);

    await gamings.get().then(response => {
      this.setState({
        startGaming: response.docs[response.docs.length - 1]
      });

      response.forEach(doc => {
        let gaming = doc.data();
        gaming.id = doc.id;

        resultGaming.push({ gaming });
      });

      this.setState({
        gamings: resultGaming
      });
    });
  };

  handleLoadMore = async () => {
    const { limitGaming, startGaming } = this.state;
    let resultGamings = gamings;

    this.state.gamings.forEach(doc => {
      resultGamings.push(doc);
    });

    const gamingsDB = db
      .collection("gaming")
      .orderBy("createdAt", "desc")
      .startAfter(startGaming)
      .data()
      .createdAt("createdAt", "desc")
      .limit(limitGaming);

    await gamingsDB.get().then(response => {
      if (response.docs.length > 0) {
        this.setState({
          startGaming: response.docs[response.docs.length - 1]
        });
      } else {
        this.setState({
          isLoading: false
        });
      }

      response.forEach(doc => {
        let gaming = doc.data();
        gaming.id = doc.id;
        resultGamings.push({ gaming });
      });

      this.setState({
        gamings: resultGamings
      });
    });
  };

  renderRow = gamings => {
    const {
      name,
      type,
      city,
      address,
      description,
      image
    } = gamings.item.gaming;

    return (
      <TouchableOpacity onPress={() => this.clickGaming(gamings)}>
        <View style={styles.viewGaming}>
          <View style={StyleSheet.viewGamingImage}>
            <Image
              resizeMode="cover"
              source={{ uri: image }}
              style={styles.imageGaming}
            />
          </View>
          <View>
            <Text style={styles.flatListGamingName}>
              {name} - {type}
            </Text>
            <Text style={styles.flatListGamingAddress}>
              {city}, {address}
            </Text>
            <Text style={styles.flatListGamingDescription}>
              {description.substr(0, 60)}...
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderFooter = () => {
    if (this.state.isLoading) {
      return (
        <View style={styles.loaderGamings}>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      return (
        <View style={styles.notFoundGamings}>
          <Text>No quedan Gaming Centers que cargar</Text>
        </View>
      );
    }
  };

  renderFlatList = gamings => {
    if (gamings) {
      return (
        <FlatList
          data={this.state.gamings}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={this.handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={this.renderFooter}
        />
      );
    } else {
      return (
        <View style={styles.startLoadGamings}>
          <ActivityIndicator size="large" />
          <Text>Cargando Gamings</Text>
        </View>
      );
    }
  };

  clickGaming = gaming => {
    this.props.navigation.navigate("ViewGaming", { gaming });
  };

  render() {
    const { gamings } = this.state;

    return (
      <View style={styles.viewBody}>
        {this.renderFlatList(gamings)}
        {this.loadActionButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  },
  startLoadGamings: {
    marginTop: 20,
    alignItems: "center"
  },
  viewGaming: {
    flexDirection: "row",
    margin: 10
  },
  viewGamingImage: {
    marginRight: 15
  },
  imageGaming: {
    width: 80,
    height: 80
  },
  flatListGamingName: {
    fontWeight: "bold"
  },
  flatListGamingAddress: {
    paddingTop: 2,
    color: "grey"
  },
  flatListGamingDescription: {
    paddingTop: 2,
    color: "grey",
    width: 300
  },
  loaderGamings: {
    marginTop: 10,
    marginBottom: 10
  },
  notFoundGamings: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center"
  }
});