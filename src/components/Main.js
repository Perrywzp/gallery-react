require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';
// 获取图片相关的数据
let imageDatas = require('../data/imageData.json');
// 利用自执行函数，将图片信息转成图片URL路径信息；
imageDatas = (function getImageURL(imageDatasArr) {
    let singleImageData;
    for (let i = 0, j = imageDatasArr.length; i < j; i++) {
        singleImageData = imageDatasArr[i];

        singleImageData.imageURL = require('../images/' + singleImageData.fileName);

        imageDatasArr[i] = singleImageData;
    }

    return imageDatasArr;
})(imageDatas);


//获取区间内的一个随机值
var getRangeRandom = (low, high) => Math.ceil(Math.random() * (high - low) + low);

//获取0～30度之间的任意正负值
var get30DegRandom = () => (Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30);

class ImgFigure extends React.Component {

    // imgFigure的点击处理函数
    handleClick(e) {
        if (this.props.arrange.isCenter) {
            this.props.inverse();
        } else {
            this.props.center();
        }

        e.stopPropagation();
        e.preventDefault();
    }

    render() {

        let styleObj = {};

        // 如果props属性中指定了这张图片的位置，则使用
        if (this.props.arrange.pos) {
            styleObj = this.props.arrange.pos;
        }

        // 如果图片的旋转角度有值，且不为0，添加旋转角度
        if (this.props.arrange.rotate) {
            ['-moz-', '-ms-', '-webkit-', ''].forEach(function (value) {
                styleObj[value + 'transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
            }.bind(this));

        }

        if(this.props.arrange.isCenter){
            styleObj.zIndex = 11;
        }

        let imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

        return (
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick.bind(this)}>
                <img src={this.props.data.imageURL} alt={this.props.data.title}/>
                <figcaption>
                    <h2 className="img-title"> {this.props.data.title} </h2>
                    <div className="img-back" onClick={this.handleClick.bind(this)}>
                        <p>{this.props.data.description}</p>
                    </div>
                </figcaption>
            </figure>
        )
    }
}


class GalleryByReactApp extends React.Component {

    /**
     * 翻转图片
     * @param index 输入当前被执行inverse操作的图片对应的图片信息数组的index值
     * @return {Function} 这是一个闭包函数，其内return一个真正待被执行的函数
     */
    inverse(index) {
        return function () {
            var imgsArrangeArr = this.state.imgsArrangeArr;

            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

            this.setState({
                imgsArrangeArr: imgsArrangeArr
            });
        }.bind(this)
    }

    /**
     * 重现布局所有图片
     * @param centerIndex 指定居中排布哪个图片
     */
    reArrange(centerIndex) {
        let imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSecX = hPosRange.leftSecX,
            hPosRangeRightSecX = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeTopY = vPosRange.topY,
            vPosRangeX = vPosRange.x,

            imgsArrangeTopArr = [],
            topImgNum = Math.ceil(Math.random() * 2), // 取一个或者不取
            topImgSpliceIndex = 0,
            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);

        // 首先居中centerIndex 的图片
        // 居中的centerIndex的图片不需要旋转
        imgsArrangeCenterArr[0] = {
            pos: centerPos,
            rotate: 0,
            isCenter: true

        };


        // 取出要布局上侧的图片的状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

        //布局位于上侧的图片
        imgsArrangeTopArr.forEach(function (value, index) {
            imgsArrangeTopArr[index] = {
                pos: {
                    top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                    left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
            }
        });

        // 布局左右两侧的图片
        for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
            var hPosRangeLORX = null;

            //前半部分布局左边， 又半部分布局右边
            if (i < k) {
                hPosRangeLORX = hPosRangeLeftSecX;
            } else {
                hPosRangeLORX = hPosRangeRightSecX;
            }

            imgsArrangeArr[i] = {
                pos: {
                    top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                    left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
            }
        }

        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        this.setState({imgsArrangeArr: imgsArrangeArr});
    }

    // 组件加载以后，为每张图片计算其位置的范围
    componentDidMount() {

        // 获取舞台的大小
        let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
            stageW = stageDOM.scrollWidth,
            stageH = stageDOM.scrollHeight,
            halfStageW = Math.ceil(stageW / 2),
            halfStageH = Math.ceil(stageH / 2);

        // 获取一个imageFigure的大小
        let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
            imgW = imgFigureDOM.scrollWidth,
            imgH = imgFigureDOM.scrollHeight,
            halfImgW = Math.ceil(imgW / 2),
            halfImgH = Math.ceil(imgH / 2);

        // 计算中心图片的位置点
        this.Constant.centerPos = {
            left: halfStageW - halfImgW,
            top: halfStageH - halfImgH
        };

        // 计算左侧，右侧区域图片排布位置的区域范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;

        // 计算上侧区域排布位置的取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;

        this.reArrange(0);
    }

    /**
     * 利用reArrange函数，居中对应index的图片
     * @param index  需要被居中的图片对应的图片信息数组的index的值
     * @returns {function(this:GalleryByReactApp)}
     */
    center(index) {
        return function () {
            this.reArrange(index);
        }.bind(this)
    }

    constructor(props) {
        super(props);
        this.state = {
            imgsArrangeArr: [
                /*{
                 pos: {
                 left: '0',
                 top: '0'
                 },
                 rotate: '0', // 旋转角度
                 isInverse: false, //图片正反面
                 isCenter:false //图片是否居中
                 }*/
            ]
        }
    }

    render() {

        var controllerUnits = [],
            imgFigures = [];
        imageDatas.forEach(function (value, index) {
            if (!this.state.imgsArrangeArr[index]) {
                this.state.imgsArrangeArr[index] = {
                    pos: {
                        left: '0',
                        top: '0'
                    },
                    rotate: '0',
                    isInverse: false,
                    isCenter: false
                }
            }

            imgFigures.push(<ImgFigure
                key={value.imageURL} data={value}
                ref={'imgFigure' + index}
                arrange={this.state.imgsArrangeArr[index]}
                inverse={this.inverse(index)}
                center={this.center(index)}
            />);
        }.bind(this));


        return (
            <section className="stage" ref="stage">
                <section className="img-sec">
                    {imgFigures}
                </section>
                <nav className="controller-nav">
                    {controllerUnits}
                </nav>
            </section>
        )
    }
}

GalleryByReactApp.defaultProps = {};

GalleryByReactApp.prototype.Constant = {
    centerPos: {
        left: 0,
        right: 0
    },
    hPosRange: { // 水平方向的取值范围
        leftSecX: [0, 0],
        rightSecX: [0, 0],
        y: [0, 0]
    },
    vPosRange: { // 垂直方向的取值范围
        x: [0, 0],
        topY: [0, 0]
    }
};

export default GalleryByReactApp;
