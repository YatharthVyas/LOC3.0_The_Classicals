import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import firebase from "./firebase";
import "firebase/database";
const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: -20,
  },
  canvas: {
    backgroundColor: "#ededed",
    border: "3px solid #999",
  },
}));

function Whiteboard(props) {
  const classes = useStyles();
  const [painting, setPainting] = useState(false);
  const [updateDrawing, setUpdateDrawing] = useState(true);
  const [ctx, setCtx] = useState(null);
  const [lastX, setLastX] = useState();
  const [lastY, setLastY] = useState();
  const [img, setImg] = useState("");
  const [imgOut, setImgOut] = useState("");
  const canvas = useRef();

  const drawCanvas = (e) => {
    if (painting) {
      let mousepos = findMousePos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(mousepos.x, mousepos.y);
      ctx.closePath();
      ctx.stroke();
      setLastX(mousepos.x);
      setLastY(mousepos.y);
      if (updateDrawing) {
        var imgdata = canvas.current.toDataURL();
        setImg(imgdata);
        firebase.database().ref(`Chats/abc`).update({ imgURL: imgdata });
        // console.log(img.length);
        setUpdateDrawing(false);
        setTimeout(() => setUpdateDrawing(true), 300);
      }
    }
  };

  const onMouseDown = (e) => {
    var m = findMousePos(e);
    setLastX(m.x);
    setLastY(m.y);
    setPainting(true);
  };

  const onMouseUp = () => {
    var imgdata = canvas.current.toDataURL();
    setImg(imgdata);
    setPainting(false);
  };

  const findMousePos = (evt) => {
    var rectBorder = canvas.current.getBoundingClientRect(); //Accounts for scroll distance and margin outside canvas
    var mouseX = evt.clientX - rectBorder.left;
    var mouseY = evt.clientY - rectBorder.top;
    return {
      x: mouseX,
      y: mouseY,
    };
  };

  useEffect(() => {
    setCtx(canvas.current.getContext("2d"));
    const onChildAdded = firebase
      .database()
      .ref(`Chats/abc`)
      .on("child_changed", (snapshot) => {
        // console.log("aaa");
        // let helperArr = [];
        // helperArr.push(snapshot.val());
        setImgOut(snapshot.toJSON());
        // setFilesArr((files) => [...files, ...helperArr]);
        console.log("VAL", snapshot.val());
      });
    return () =>
      firebase.database().ref("Chats").off("child_added", onChildAdded);
  }, []);
  return (
    <div className={classes.root}>
      <canvas
        ref={canvas}
        id="myCanvas"
        height="500"
        width="800"
        onMouseMove={drawCanvas}
        onClick={drawCanvas}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        className={classes.canvas}
      ></canvas>
      {/* {console.log(imgOut)} */}
      <img src={imgOut} alt="output" />
    </div>
  );
}

export default Whiteboard;
