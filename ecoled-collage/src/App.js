import React from 'react';
import useImage from 'use-image';
import { Stage, Layer, Transformer, Image as KonvaImage } from 'react-konva';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import * as loadImage from 'blueimp-load-image';
import { makeStyles } from '@material-ui/core/styles';
import { saveAs } from 'file-saver';
import addToCart from './icons/cart-arrow-down.svg';
import longArrowLeft from './icons/long-arrow-left.svg';
import uploadImage from './icons/upload-image.svg';
import { BrowserView, MobileView } from 'react-device-detect';

const useStyles = makeStyles({
  outerContainer: {
    display: 'flex',
  },
  stageContainerAfterUpload: {
    width: '100%',
    alignContent: 'center',
    alignItems: 'center',
  },
  mobileViewBeforeUpload: {
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
  buttonContainerAfterUploadMobile: {
    height: '70px',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  mobileViewAfterUpload: {
    height: '70px',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  browserViewAfterUpload: {
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
    width: '100%',
  },
  browserViewBeforeUpload: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  singleButtonContainerAfterUpload: {
    width: '48%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleButtonContainerAfterUploadMobile: {
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonAfterUpload: {
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
  hidden: {
    visibility: 'hidden',
  },
  backButton: {
    top: 0,
    position: 'absolute',
  },
  uploadIcon: {
    display: 'flex',
    width: '45px',
    justifyContent: 'center',
  }
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
    data.node.images.edges.forEach((product) => {
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
        crossOrigin="anonymous"
        fill=""
        image={image}
        onTap={onSelect}
        onClick={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
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
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
          ]}
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
  let productVariantId = urlParams.get('product_variant_id');
  let productId;
  let variantQuery;
  let productQuery;
  if (productVariantId) {
    const productVariantIdQuery = btoa(
      'gid://shopify/ProductVariant/' + productVariantId
    );
    variantQuery = gql`
      query query {
        node(id: "${productVariantIdQuery}") {
          ... on ProductVariant {
            id
            product{
              id
            }
          }
        }
      }
    `;
  } else {
    variantQuery = gql`
      query query {
        shop {
          name
        }
      }
    `;
  }
  const { data: variantData } = useQuery(variantQuery);
  if (variantData && variantData.node) {
    productId = variantData.node.product.id;
  }
  if (productId) {
    productQuery = gql`
      query query {
        node(id: "${productId}") {
          ... on Product {
            onlineStoreUrl
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
    productQuery = gql`
      query query {
        shop {
          name
        }
      }
    `;
  }

  const classes = useStyles();
  const { data } = useQuery(productQuery);
  const canvasStage = React.createRef();
  let newImage = new Image();

  const [backgroundImage, setBackgroundImage] = React.useState(null);
  const [image, setImage] = React.useState(null);
  const [selected, setSelected] = React.useState(true);
  const [savePicture, setSavePicture] = React.useState(false);
  const [innerWidth, setInnerWidth] = React.useState(window.innerWidth);
  const [innerHeight, setInnerHeight] = React.useState(window.innerHeight);
  const [shape, setShape] = React.useState(null);
  const [currentOrientation, setCurrentOrientation] = React.useState(null);
  const [offset, setOffset] = React.useState(null);
  const [backgroundCanvasWidth, setBackgroundCanvasWidth] = React.useState(
    null
  );
  const [backgroundCanvasHeight, setBackgroundCanvasHeight] = React.useState(
    null
  );

  function changeOffset(scaledImage) {
    //The picture gets put in the center of the screen with offset
    //orientationInnerHeight (width) - scaledImage.height (width) gets the full blank space
    //and  "/2" makes the space even on either side
    let offsetX;
    let offsetY;
    if (scaledImage.width / window.devicePixelRatio < window.innerWidth) {
      offsetX =
        (window.innerWidth - scaledImage.width / window.devicePixelRatio) / 2;
    }
    if (scaledImage.height / window.devicePixelRatio < window.innerHeight) {
      offsetY =
        (window.innerHeight - scaledImage.height / window.devicePixelRatio) / 2;
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
    const orientationInnerWidth = window.innerWidth;
    const orientationInnerHeight = window.innerHeight;
    if (backgroundImage) {
      const scaledImage = loadImage.scale(backgroundImage, {
        maxWidth: orientationInnerWidth,
        maxHeight: orientationInnerHeight - 140,
        downsamplingRatio: 0.2,
        pixelRatio: window.devicePixelRatio,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
        canvas: true,
      });
      setImage(scaledImage);
      setBackgroundCanvasWidth(parseInt(scaledImage.style.width, 10));
      setBackgroundCanvasHeight(parseInt(scaledImage.style.height, 10));
      let offsetX;
      let offsetY;
      if (scaledImage.width / window.devicePixelRatio < orientationInnerWidth) {
        offsetX =
          (orientationInnerWidth -
            scaledImage.width / window.devicePixelRatio) /
          2;
      }
      if (
        scaledImage.height / window.devicePixelRatio <
        orientationInnerHeight
      ) {
        offsetY =
          (orientationInnerHeight -
            scaledImage.height / window.devicePixelRatio) /
          2;
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
    window.onorientationchange = function () {
      //Checks if the screen was rotated
      //timeout implemented to check if the phone was rotated 180° which is sometimes not noticed by
      //window.onorientationChange
      this.setTimeout(() => {
        if (window.innerHeight !== innerHeight) {
          changeOrientation();
        }
      }, 400);
    };
  }, [backgroundImage, newImage]);

  let backgroundImageUpload = false;
  if (backgroundImage !== null) {
    backgroundImageUpload = true;
  }

  React.useEffect(() => {
    if (!selected && savePicture) {
      let canvasStageSave = canvasStage.current;
      const canvasStageData = canvasStageSave.toDataURL({
        pixelRatio: window.devicePixelRatio,
        mimeType: 'image/png',
      });
      saveAs(canvasStageData, 'collage.png');
      setSavePicture(false);
    }
  }, [savePicture]);

  const handleImageUpload = (e) => {
    const [file] = e.target.files;
    if (file) {
      loadImage(
        file,
        (img) => {
          const scaledImage = loadImage.scale(img, {
            maxWidth: innerWidth,
            maxHeight: innerHeight - 140,
            downsamplingRatio: 0.2,
            pixelRatio: window.devicePixelRatio,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
            canvas: true,
          });
          setImage(scaledImage);
          setBackgroundImage(img);
          changeOffset(scaledImage);
          if (
            scaledImage.style &&
            scaledImage.style.height &&
            scaledImage.style.width
          ) {
            setBackgroundCanvasHeight(parseInt(scaledImage.style.height, 10));
            setBackgroundCanvasWidth(parseInt(scaledImage.style.width, 10));
          } else if (scaledImage.style && scaledImage.style.height) {
            setBackgroundCanvasHeight(parseInt(scaledImage.style.height, 10));
            setBackgroundCanvasWidth(scaledImage.width);
          } else if (scaledImage.style && scaledImage.style.width) {
            setBackgroundCanvasHeight(scaledImage.height);
            setBackgroundCanvasWidth(parseInt(scaledImage.style.width, 10));
          } else {
            setBackgroundCanvasHeight(scaledImage.height);
            setBackgroundCanvasWidth(scaledImage.width);
          }
        },
        {
          orientation: true,
        }
      );
    }
  };

  const saveImage = () => {
    setSelected(false);
    setSavePicture(true);
  };

  if (window.matchMedia(`(orientation: ${currentOrientation} )`) === false) {
    changeOrientation();
  }

  return (
    <div className={classes.outerContainer} style={{height: window.innerHeight}}>
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
              width={backgroundCanvasWidth}
              height={backgroundCanvasHeight}
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
      <BrowserView
        viewClassName={
          backgroundImageUpload
            ? classes.browserViewAfterUpload
            : classes.browserViewBeforeUpload
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
                ? classes.buttonAfterUpload
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
          style={!backgroundImageUpload ? { display: 'none' } : null}
          className={classes.singleButtonContainerAfterUpload}
        >
          <label className={classes.buttonAfterUpload} onClick={saveImage}>
            Bild Speichern
          </label>
        </div>
      </BrowserView>
      <MobileView
        viewClassName={
          backgroundImageUpload
            ? classes.mobileViewAfterUpload
            : classes.mobileViewBeforeUpload
        }
        style={(window.innerHeight === backgroundCanvasHeight - 140) ?
          {bottom: 0} : {bottom: (window.innerHeight - backgroundCanvasHeight) / 4 - 35}
        }
        
      >
        {backgroundImageUpload ? (
          <div>
            <label htmlFor="files">
              <img
                alt="uploadImage"
                src={uploadImage}
                style={{ height: '45px', width: '45px' }}
              />
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
        ) : (
          <div
            className={
              backgroundImageUpload
                ? classes.hidden
                : classes.singleButtonContainerBeforeUpload
            }
          >
            <label
              className={
                backgroundImageUpload
                  ? classes.buttonAfterUpload
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
        )}
        <div
          style={!backgroundImageUpload ? { display: 'none' } : null}
          className={classes.singleButtonContainerAfterUploadMobile}
        >
          <label className={classes.buttonAfterUpload} onClick={saveImage}>
            Bild Speichern
          </label>
        </div>
        <div className={classes.uploadIcon} style={!backgroundImageUpload ? { display: 'none' } : null}>
          <form
            action={
              data && data.node
                ? `${process.env.REACT_APP_SHOPIFY_URI}cart/add`
                : process.env.REACT_APP_SHOPIFY_URI
            }
          >
            <input
              type="hidden"
              name="id"
              value={productVariantId ? productVariantId : ''}
            />
            <button
              type="submit"
              style={{ border: 'none', background: 'transparent' }}
            >
              <img
                alt="addToCart"
                src={addToCart}
                style={{ height: '45px', width: '45px' }}
              />
            </button>
          </form>
        </div>
      </MobileView>
      <MobileView
        viewClassName={classes.backButton}
        style={!backgroundImageUpload ? { display: 'none' } : null}
      >
        <form
          action={
            data && data.node
              ? data.node.onlineStoreUrl
              : process.env.REACT_APP_SHOPIFY_URI
          }
        >
          <button style={{ border: 'none', background: 'transparent' }} type="submit">
            <img
              alt="backArrow"
              src={longArrowLeft}
              style={{
                height: '50px',
                width: '50px',
              }}
            />
          </button>
        </form>
      </MobileView>
    </div>
  );
};

export default PictureCollage;
