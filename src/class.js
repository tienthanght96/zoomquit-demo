
class ZoomImage {
  constructor() {
    this.canvas = document.getElementById('canvas')
    this.loadingElement = document.getElementById('loading')
    this.screenHeight = window.innerHeight
    this.screenWidth = window.innerWidth
    this.context = null
    this.totalImagesLoaded = 0
    this.imgIndex = 0
    this.timer = 0
    this.totalImages = 0
    this.loopImages = []
  }

  animateElements() {
    if (this.totalImagesLoaded === this.totalImages) {
      gsap.to(this.loadingElement.querySelector('.loading-progress__value'), {
        width:
          Math.floor(this.totalImagesLoaded / this.totalImages) * 100 + '%',
      })
    } else {
      gsap.to(this.loadingElement, {
        display: 'none',
      })
    }
  }

  createImageElement(src) {
    const img = new Image()
    img.src = src
    img.onload = () => {
      this.totalImagesLoaded++
      this.animateElements()
    }

    return img
  }

  importImages() {
    const imagesFileNames = Array.from(Array(87).keys()).reduce((acc, item) => {
      acc[`${item + 1}.jpg`] = null
      return acc
    }, {})
    Object.keys(imagesFileNames).forEach((key) => {
      imagesFileNames[key] = this.createImageElement(
        require(`./assets/${key}`).default
      )
    })
    this.images = Object.values(imagesFileNames)
  }

  calculateCenterPosition(w, h) {
    const x = this.screenWidth / 2 - w / 2
    const y = this.screenHeight / 2 - h / 2
    return { x, y }
  }

  initLoopImages() {
    for (let i = 0; i < this.images.length; i++) {
      var w = this.screenWidth
      var h = this.screenHeight

      this.loopImages.push({
        width: w,
        height: h,
        image: this.images[i],
        ratio: h / w,
      })
    }
  }

  init() {
    this.importImages()
    this.canvas.setAttribute('width', this.screenWidth)
    this.canvas.setAttribute('height', this.screenHeight)
    this.context = this.canvas.getContext('2d')
  }

  drawImages() {
    this.context.clearRect(0, 0, this.screenWidth, this.screenHeight)

    const currentItem = this.loopImages[this.imgIndex]
    const nextItem = this.loopImages[
      this.imgIndex === this.totalImages ? 0 : this.imgIndex + 1
    ]
    this.timer += 10
    let width = currentItem.width + this.timer
    let height = currentItem.height + this.timer * currentItem.ratio

    const { x: x1, y: y1 } = this.calculateCenterPosition(width, height)
    const { x: x2, y: y2 } = this.calculateCenterPosition(
      width * 0.5,
      height * 0.5
    )
    this.context.drawImage(currentItem.image, x1, y1, width, height)
    this.context.drawImage(nextItem.image, x2, y2, width * 0.5, height * 0.5)

    if (width > this.screenWidth * 2) {
      this.imgIndex += 1
      this.timer = 0
    }

    if (this.imgIndex > this.loopImages.length) {
      this.imgIndex = 0
    }

    window.requestAnimationFrame(this.drawImages.bind(this))
  }

  start() {
    if (!this.context) {
      return
    }
    this.initLoopImages()
    window.requestAnimationFrame(this.drawImages.bind(this))
  }
}

;(function () {
  window.onload = function () {
    const zoomImage = new ZoomImage()
    zoomImage.init()
    zoomImage.start()
  }
})()