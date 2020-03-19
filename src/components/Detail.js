import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import "../index.css";
import { withStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import UpdateIcon from "@material-ui/icons/Update";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

const databaseURL = "https://word-cloud-a581f.firebaseio.com/";
const apiURL = "http://localhost:5000";

const styles = theme => ({
  fab: {
    position: "fixed",
    bottom: "20px",
    right: "20px"
  }
});

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialog: false,
      textContent: "",
      words: {},
      imageUrl: null
    };
  }

  componentDidMount() {
    this._getText();
    this._getWords();
    this._getImage();
  }

  _getText() {
    fetch(`${databaseURL}/texts/${this.props.match.params.textID}.json`)
      .then(res => {
        if (res.status != 200) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then(text => this.setState({ textContent: text["textContent"] }));
  }

  _getWords() {
    fetch(`${databaseURL}/words.json`)
      .then(res => {
        if (res.status != 200) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then(words => this.setState({ words: words == null ? {} : words }));
  }

  _getImage() {
    fetch(`${apiURL}/validate?textID=${this.props.match.params.textID}`)
      .then(res => {
        if (res.status != 200) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then(data => {
        if (data["result"] == true) {
          this.setState({
            imageUrl:
              apiURL + "/outputs?textID=" + this.props.match.params.textID
          });
        } else {
          this.setState({ imageUrl: "NONE" });
        }
      });
  }

  handleDialogToggle = () =>
    this.setState({
      dialog: !this.state.dialog
    });

  handleSubmit = () => {
    this.setState({ imageUrl: "READY" });
    const wordCloud = {
      textID: this.props.match.params.textID,
      text: this.state.textContent,
      maxCount: 30,
      minLength: 3,
      words: this.state.words
    };
    this.handleDialogToggle();
    if (
      !wordCloud.textID ||
      !wordCloud.text ||
      !wordCloud.maxCount ||
      !wordCloud.minLength ||
      !wordCloud.words
    ) {
      return;
    }
    this._post(wordCloud);
  };

  _post = wordCloud => {
    fetch(`${apiURL}/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(wordCloud)
    })
      .then(res => {
        if (res.status != 200) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then(date =>
        this.setState({
          imageUrl: apiURL + "/outputs?textID=" + this.props.match.params.textID
        })
      );
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Card>
          <CardContent>
            {this.state.imageUrl ? (
              this.state.imageUrl == "READY" ? (
                "Loading the word cloud image..."
              ) : this.state.imageUrl == "NONE" ? (
                "Please create the word cloud for the text!"
              ) : (
                <img
                  key={Math.random()}
                  src={this.state.imageUrl + "&random=" + Math.random()}
                  style={{ width: "100%" }}
                />
              )
            ) : (
              ""
            )}
          </CardContent>
        </Card>
        <Fab
          color="primary"
          className={classes.fab}
          onClick={this.handleDialogToggle}
        >
          <UpdateIcon />
        </Fab>
        <Dialog open={this.state.dialog} onClose={this.handleDialogToggle}>
          <DialogTitle>Create Word Cloud</DialogTitle>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleSubmit}
            >
              {this.state.imageUrl == "NONE" ? "Create" : "Re-create"}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={this.handleDialogToggle}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(Detail);
