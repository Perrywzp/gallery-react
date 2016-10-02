require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
// 获取图片相关的数据
let imageDatas = require('../data/imageData.json');
// 利用自执行函数，将图片信息转成图片URL路径信息；
imageDatas = (function getImageURL(imageDatasArr){
    var singleImageData;
    for(let i=0, j = imageDatasArr.length; i < j; i++){
        singleImageData=  imageDatasArr[i];

        singleImageData.imageURL = require('../images/' + singleImageData.fileName);

        imageDatasArr[i] = singleImageData.imageURL;
    }

    return imageDatasArr;
})(imageDatas);



class GalleryByReactApp extends React.Component {
  render() {
      return (
          <section className="stage">
              <section className="img-sec">

              </section>
              <nav className="controller-nav">

              </nav>
          </section>
      )
  }
}

GalleryByReactApp.defaultProps = {
};

export default GalleryByReactApp;
