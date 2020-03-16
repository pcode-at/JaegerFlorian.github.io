import React from 'react';
import useImage from 'use-image';
import { Stage, Layer, Transformer, Image as KonvaImage } from 'react-konva';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import * as loadImage from 'blueimp-load-image';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DeviceOrientation, { Orientation } from 'react-screen-orientation';

const query = gql`
  query query {
    products(first: 1, query: "title:'Ecoled Blade One'") {
      edges {
        node {
          id
          title
          images(first: 1) {
            edges {
              node {
                originalSrc
              }
            }
          }
        }
      }
    }
  }
`;

const useStyles = makeStyles({
  outerContainer: {
    height: '100vh',
    display: 'flex',
  },
  stageContainerBeforeUpload: {},
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
    fontFamily: 'Work Sans',
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
  buttonLabel: {
    width: '100%',
  },
  buttonBeforeUpload: {
    background: '#252a2b',
    fontFamily: 'Work Sans',
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

const Lamp = ({ data, shapeProps, isSelected, onSelect, onChange }) => {
  let lampUrl;
  if (data) {
    lampUrl = data.products.edges[0].node.images.edges[0].node.originalSrc;
  }
  const [image] = useImage(lampUrl, 'Anonymous');
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

  React.useEffect(() => {
    window.onorientationchange = function() {
      if (backgroundImage) {
        const scaledImage = loadImage.scale(backgroundImage, {
          maxWidth: window.innerHeight,
          maxHeight: window.innerWidth,
        });
        setImage(scaledImage);
        let offsetX = window.innerHeight - scaledImage.width;
        let x = offsetX / 2;
        let offsetY = window.innerWidth - scaledImage.height;
        let y = offsetY / 2;
        setShape({ x: x, y: y, width: 150, height: 240 });
        setInnerHeight(window.innerWidth);
        setInnerWidth(window.innerHeight);
      }
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
            maxWidth: window.innerWidth,
            maxHeight: window.innerHeight,
          });
          setImage(scaledImage);
          setBackgroundImage(img);
        },
        { orientation: true }
      );
    }
  };

  function downloadURI(uri, name) {
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const saveImage = () => {
    let canvasStageSave = canvasStage.current;
    const canvasStageData = canvasStageSave.toDataURL({
      mimeType: 'image/png',
    });
    downloadURI(canvasStageData, 'collage.png');
  };

  let x;
  let y;
  if (image) {
    if (image.width < innerWidth) {
      let offsetX = innerWidth - image.width;
      x = offsetX / 2;
    }
    if (image.height < innerHeight) {
      let offsetY = innerHeight - image.height;
      y = offsetY / 2;
    }
    if (shape === null) {
      setShape({ x: x, y: y, width: 150, height: 240 });
    }
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
            <KonvaImage x={x} y={y} image={image} />
          </Layer>
          <Layer visible={backgroundImageUpload}>
            <Lamp
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
