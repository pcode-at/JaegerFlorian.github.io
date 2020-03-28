import React from 'react';
import useImage from 'use-image';
import { Stage, Layer, Transformer, Image as KonvaImage } from 'react-konva';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import * as loadImage from 'blueimp-load-image';
import { makeStyles } from '@material-ui/core/styles';
import { saveAs } from 'file-saver';

const useStyles = makeStyles({
  outerContainer: {
    height: '100vh',
    display: 'flex',
  },
  stageContainerAfterUpload: {
    width: '100%',
    alignContent: 'center',
    alignItems: 'center',
  },
  buttonContainerAfterUpload: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    justifyContent: 'space-evenly',
  },
  buttonContainerBeforeUpload: {
    width: '100%',
  },
  singleButtonContainerBeforeUpload: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleButtonContainerAfterUpload: {
    width: '48%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    background: '#252a2b',
    fontFamily: 'sans-serif',
    fontStyle: 'normal',
    color: 'white',
    border: '2px solid transparent',
    fontWeight: 700,
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: 0,
    padding: '15px 30px',
    textAlign: 'center',
    width: '100%',
    alignSelf: 'stretch',
  },
  buttonBeforeUpload: {
    background: '#252a2b',
    fontFamily: 'sans-serif',
    fontStyle: 'normal',
    color: 'white',
    border: '2px solid transparent',
    fontWeight: 700,
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: 0,
    padding: '15px 30px',
    width: '50%',
    display: 'flex',
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

const Lamp = ({
  backgroundImage,
  data,
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const [lampUrl, setLampUrl] = React.useState(null);
  let lampHeight;
  let lampWidth;
  if (
    data &&
    data.node &&
    data.node.images &&
    data.node.images.edges.length !== 0 &&
    lampUrl === null
  ) {
    data.node.images.edges.forEach(product => {
      if (product.node.altText === 'collage') {
        setLampUrl(product.node.originalSrc);
      }
    });
  }
  const [image] = useImage(lampUrl, 'Anonymous');
  if (
    image &&
    shapeProps &&
    shapeProps.height === null &&
    shapeProps.width === null
  ) {
    const aspectRatio = image.width / image.height;
    if (backgroundImage) {
      if (
        backgroundImage.height > backgroundImage.width &&
        window.innerHeight > window.innerWidth
      ) {
        lampHeight = window.innerHeight / 4;
      } else if (
        backgroundImage.height > backgroundImage.width &&
        window.innerHeight < window.innerWidth
      ) {
        lampHeight = window.innerHeight / 3;
      } else if (
        backgroundImage.height < backgroundImage.width &&
        window.innerHeight > window.innerWidth
      ) {
        lampHeight = window.innerHeight / 6;
      } else {
        lampHeight = window.innerHeight / 3;
      }
      lampWidth = lampHeight * aspectRatio;
      shapeProps.width = lampWidth;
      shapeProps.height = lampHeight;
    }
  }
  const shapeRef = React.useRef();
  const trRef = React.useRef();
  React.useEffect(() => {
    if (isSelected) {
      trRef.current.setNode(shapeRef.current);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        crossOrigin="anonymus"
        fill=""
        image={image}
        onTap={onSelect}
        onClick={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={e => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={e => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const PictureCollage = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const productId = urlParams.get('product_id');
  let query;
  if (productId) {
    query = gql`
      query query {
        node(id: "${productId}") {
          ... on Product {
            images(first: 100) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
          }
        }
      }
    `;
  } else {
    query = gql`
      query query {
        shop {
          name
        }
      }
    `;
  }

  const classes = useStyles();
  const { data } = useQuery(query);
  const canvasStage = React.createRef();

  let newImage = new Image();

  const [backgroundImage, setBackgroundImage] = React.useState(null);
  const [image, setImage] = React.useState(null);
  const [selected, setSelected] = React.useState(false);
  const [innerHeight, setInnerHeight] = React.useState(window.innerHeight);
  const [innerWidth, setInnerWidth] = React.useState(window.innerWidth);
  const [shape, setShape] = React.useState(null);
  const [currentOrientation, setCurrentOrientation] = React.useState(null);
  const [offset, setOffset] = React.useState(null);

  function changeOffset(scaledImage) {
    //The picture gets put in the center of the screen with offset
    //orientationInnerHeight (width) - scaledImage.height (width) gets the full blank space
    //and  "/2" makes the space even on either side
    let offsetX;
    let offsetY;
    if (scaledImage.width < innerWidth) {
      offsetX = (innerWidth - scaledImage.width) / 2;
    }
    if (scaledImage.height < innerHeight) {
      offsetY = (innerHeight - scaledImage.height) / 2;
    }
    setOffset({ x: offsetX, y: offsetY });
    setShape({
      x: offsetX,
      y: offsetY,
      width: null,
      height: null,
    });
  }

  function changeOrientation() {
    //Gets the current orientation before the phone rotates, so true means that the phone will be in landscape afterwards
    const orientation = window.matchMedia('(orientation: portrait)');
    if (orientation.matches === true) {
      setCurrentOrientation('landscape');
    } else {
      setCurrentOrientation('portrait');
    }
    //The innerWidth is from before the rotation, so the width of the image has to be set to the innerHeight
    const orientationInnerWidth = innerHeight;
    const orientationInnerHeight = innerWidth;
    if (backgroundImage) {
      const scaledImage = loadImage.scale(backgroundImage, {
        maxWidth: orientationInnerWidth,
        maxHeight: orientationInnerHeight,
      });
      setImage(scaledImage);
      let offsetX;
      let offsetY;
      if (scaledImage.width < orientationInnerWidth) {
        offsetX = (orientationInnerWidth - scaledImage.width) / 2;
      }
      if (scaledImage.height < orientationInnerHeight) {
        offsetY = (orientationInnerHeight - scaledImage.height) / 2;
      }
      setOffset({ x: offsetX, y: offsetY });
      setShape({
        x: offsetX,
        y: offsetY,
        width: null,
        height: null,
      });
    }
    //Sets the innerHeight for after the rotation
    setInnerHeight(orientationInnerHeight);
    setInnerWidth(orientationInnerWidth);
  }

  React.useEffect(() => {
    window.onorientationchange = function() {
      changeOrientation();
      //Checks if the screen was rotated once more after the changeOrientation function is called
      //to check if the phone was rotated 180° which is sometimes not noticed by
      //window.onorientationChange
      this.setTimeout(() => {
        if (this.window.innerHeight !== innerHeight) {
          changeOrientation();
        }
      }, 400);
    };
  }, [backgroundImage, newImage]);

  let backgroundImageUpload = false;
  if (backgroundImage !== null) {
    backgroundImageUpload = true;
  }

  const handleImageUpload = e => {
    const [file] = e.target.files;
    if (file) {
      loadImage(
        file,
        img => {
          const scaledImage = loadImage.scale(img, {
            maxWidth: innerWidth,
            maxHeight: innerHeight,
          });
          setImage(scaledImage);
          setBackgroundImage(img);
          changeOffset(scaledImage);
        },
        { orientation: true }
      );
    }
  };

  const saveImage = () => {
    setSelected(false);
    let canvasStageSave = canvasStage.current;
    const canvasStageData = canvasStageSave.toDataURL({
      mimeType: 'image/png',
    });
    saveAs(canvasStageData, 'collage.png');
  };

  if (window.matchMedia(`(orientation: ${currentOrientation} )`) === false) {
    changeOrientation();
  }

  return (
    <div className={classes.outerContainer}>
      <div
        className={
          backgroundImageUpload
            ? classes.stageContainerAfterUpload
            : classes.stageContainerBeforeUpload
        }
      >
        <Stage
          visible={backgroundImageUpload}
          ref={canvasStage}
          width={innerWidth}
          height={innerHeight}
        >
          <Layer
            onClick={() => {
              setSelected(false);
            }}
            onTap={() => {
              setSelected(false);
            }}
          >
            <KonvaImage
              x={shape ? offset.x : 0}
              y={shape ? offset.y : 0}
              image={image}
            />
          </Layer>
          <Layer visible={backgroundImageUpload}>
            <Lamp
              backgroundImage={image}
              data={data}
              shapeProps={shape}
              isSelected={selected}
              onSelect={() => {
                setSelected(true);
              }}
              onChange={setShape}
            />
          </Layer>
        </Stage>
      </div>
      <div
        className={
          backgroundImageUpload
            ? classes.buttonContainerAfterUpload
            : classes.buttonContainerBeforeUpload
        }
      >
        <div
          className={
            backgroundImageUpload
              ? classes.singleButtonContainerAfterUpload
              : classes.singleButtonContainerBeforeUpload
          }
        >
          <label
            className={
              backgroundImageUpload
                ? classes.button
                : classes.buttonBeforeUpload
            }
            htmlFor="files"
          >
            Bild hochladen
            <input
              id="files"
              visibility="hidden"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </label>
        </div>
        <div
          style={
            backgroundImageUpload
              ? { visibility: 'visible' }
              : { visibility: 'hidden' }
          }
          className={classes.singleButtonContainerAfterUpload}
        >
          <label className={classes.button} onClick={saveImage}>
            Bild Speichern
          </label>
        </div>
      </div>
    </div>
  );
};

export default PictureCollage;
